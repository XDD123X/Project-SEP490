import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";
import App from "./App.jsx";
import { StoreProvider } from "./services/StoreContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "1077136440743-h8p80fnhmg7lp2otiugmsug98173njhl.apps.googleusercontent.com"

createRoot(document.getElementById("root")).render(
  //<StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <StoreProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StoreProvider>
    </GoogleOAuthProvider>
  //</StrictMode>
);
