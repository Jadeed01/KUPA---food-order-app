from django.conf import settings
from django.contrib.auth import authenticate
from google.auth.transport import requests as g_requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import EmailOTP, User
from .serializers import (
    ForgotPasswordSerializer,
    GoogleAuthSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResendOTPSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from .utils import check_otp, send_otp, tokens_for


class AuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class RegisterView(AuthView):
    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data

        user = User.objects.filter(email=d["email"]).first()
        if user and user.is_verified:
            return Response(
                {"detail": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user:  # signed up before but never verified -> refresh details
            user.full_name = d["full_name"]
            user.set_password(d["password"])
            user.save()
        else:
            user = User.objects.create_user(
                email=d["email"], password=d["password"], full_name=d["full_name"]
            )

        send_otp(user, EmailOTP.Purpose.VERIFY)
        return Response(
            {"detail": "Verification code sent.", "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(AuthView):
    def post(self, request):
        s = VerifyOTPSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.filter(email=s.validated_data["email"]).first()

        if not user or not check_otp(user, s.validated_data["code"], EmailOTP.Purpose.VERIFY):
            return Response(
                {"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST
            )

        user.is_verified = True
        user.save(update_fields=["is_verified"])
        return Response({**tokens_for(user), "user": UserSerializer(user).data})


class ResendOTPView(AuthView):
    def post(self, request):
        s = ResendOTPSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.filter(email=s.validated_data["email"]).first()
        purpose = s.validated_data["purpose"]

        if user and (purpose == EmailOTP.Purpose.RESET or not user.is_verified):
            send_otp(user, purpose)
        # same response either way so emails can't be enumerated
        return Response({"detail": "If the account exists, a new code was sent."})


class LoginView(AuthView):
    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email, password = s.validated_data["email"], s.validated_data["password"]

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED
            )
        if not user.is_verified:
            send_otp(user, EmailOTP.Purpose.VERIFY)
            return Response(
                {
                    "detail": "Email not verified. We sent you a new code.",
                    "code": "email_not_verified",
                    "email": user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response({**tokens_for(user), "user": UserSerializer(user).data})


class ForgotPasswordView(AuthView):
    def post(self, request):
        s = ForgotPasswordSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.filter(email=s.validated_data["email"]).first()
        if user:
            send_otp(user, EmailOTP.Purpose.RESET)
        return Response({"detail": "If the account exists, a reset code was sent."})


class ResetPasswordView(AuthView):
    def post(self, request):
        s = ResetPasswordSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        user = User.objects.filter(email=d["email"]).first()

        if not user or not check_otp(user, d["code"], EmailOTP.Purpose.RESET):
            return Response(
                {"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(d["new_password"])
        user.is_verified = True  # they proved they own the inbox
        user.save()
        return Response({"detail": "Password reset successful."})


class GoogleAuthView(AuthView):
    def post(self, request):
        s = GoogleAuthSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {"detail": "Google sign-in is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            info = id_token.verify_oauth2_token(
                s.validated_data["credential"], g_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response({"detail": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)

        if not info.get("email_verified"):
            return Response(
                {"detail": "Google email not verified."}, status=status.HTTP_400_BAD_REQUEST
            )

        email = info["email"].lower()
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(
                email=email, password=None, full_name=info.get("name", ""), is_verified=True
            )
        elif not user.is_verified:
            user.is_verified = True
            user.save(update_fields=["is_verified"])

        return Response({**tokens_for(user), "user": UserSerializer(user).data})


class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
