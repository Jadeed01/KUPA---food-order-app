import hmac

from django.conf import settings
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailOTP


def send_otp(user, purpose):
    otp = EmailOTP.generate(user, purpose)
    if purpose == EmailOTP.Purpose.VERIFY:
        subject = "Verify your Kupa account"
        intro = "Use this code to verify your email"
    else:
        subject = "Reset your Kupa password"
        intro = "Use this code to reset your password"
    message = (
        f"Hi {user.full_name or 'there'},\n\n"
        f"{intro}: {otp.code}\n\n"
        f"It expires in {settings.OTP_EXPIRY_MINUTES} minutes. "
        "If you didn't request this, ignore this email."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


def check_otp(user, code, purpose):
    otp = (
        EmailOTP.objects.filter(user=user, purpose=purpose, is_used=False)
        .order_by("-created_at")
        .first()
    )
    if not otp or otp.is_expired() or otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        return False
    if not hmac.compare_digest(otp.code, str(code)):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        return False
    otp.is_used = True
    otp.save(update_fields=["is_used"])
    return True


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}