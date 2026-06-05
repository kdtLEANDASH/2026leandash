import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AppProvider } from "@/store/AppProvider";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <App />
  </AppProvider>
);