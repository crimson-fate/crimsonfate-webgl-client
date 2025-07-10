import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StarknetProvider } from "./context/ControllerConnector.tsx";
import { HelmetProvider } from "react-helmet-async";
import InstallPWAButton from "./components/button/button-install.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <StarknetProvider>
        <App />
        <InstallPWAButton />
      </StarknetProvider>
    </HelmetProvider>
  </StrictMode>
);
