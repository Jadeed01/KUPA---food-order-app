import { AnimatePresence } from "motion/react";
import { Route, Routes, useLocation } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import { ProductSheetProvider } from "./context/ProductSheetContext";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Congratulations from "./pages/Congratulations";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Location from "./pages/Location";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/congratulations" element={<Congratulations />} />

        <Route path="/home" element={guard(<Home />)} />
        <Route path="/menu" element={guard(<Menu />)} />
        <Route path="/cart" element={guard(<Cart />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/location" element={guard(<Location />)} />
        <Route path="/order-success" element={guard(<OrderSuccess />)} />
        <Route path="/orders" element={guard(<Orders />)} />
        <Route path="/orders/:id" element={guard(<OrderDetail />)} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <PhoneFrame>
      <ProductSheetProvider>
        <AnimatedRoutes />
        <BottomNav />
      </ProductSheetProvider>
    </PhoneFrame>
  );
}