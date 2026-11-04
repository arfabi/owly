import React from "react";
import ReactDOM from "react-dom/client";
import { WelcomeApp } from "./welcome/WelcomeApp";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <WelcomeApp />
    </React.StrictMode>
  );
}

