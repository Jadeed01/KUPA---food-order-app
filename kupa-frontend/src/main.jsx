import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MenuProvider } from "./context/MenuContext.jsx";
import { AddressProvider } from "./context/AddressContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const app = (
  <BrowserRouter>
    <AuthProvider>
      <MenuProvider>
        <AddressProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AddressProvider>
      </MenuProvider>
    </AuthProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {clientId ? <GoogleOAuthProvider clientId={clientId}>{app}</GoogleOAuthProvider> : app}
  </StrictMode>
);