import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { store } from "./context/store";
import { AuthProvider } from "./context/AuthContext";
import { AppRouter } from "./router";
import { OnScreenKeyboard } from "./components/keyboard/OnScreenKeyboard";
import "./styles.css";

const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <AppRouter />
          <OnScreenKeyboard />
        </AuthProvider>
      </Router>
    </Provider>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
