import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";
import App from "./App.jsx";
import { StoreProvider } from "./services/StoreContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StoreProvider>
  </StrictMode>
);
