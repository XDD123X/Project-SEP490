import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";
import App from "./App.jsx";
import { StoreProvider } from "./services/StoreContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from "./services/NotificationContext";
import { SignalRProvider } from "./hooks/signalRProvider";

const clientId = "1077136440743-h8p80fnhmg7lp2otiugmsug98173njhl.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  //<StrictMode>
  <GoogleOAuthProvider clientId={clientId}>
    <SignalRProvider>
      <StoreProvider>
        <ThemeProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ThemeProvider>
      </StoreProvider>
    </SignalRProvider>
  </GoogleOAuthProvider>
  //</StrictMode>
);
