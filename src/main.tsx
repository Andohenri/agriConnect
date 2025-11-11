import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";



import AppRouter from "./routes/AppRouter.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ProductProvider } from "./contexts/ProductContext.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ProductProvider>
        <AppRouter />
        <Toaster />
      </ProductProvider>
    </AuthProvider>
  </StrictMode>
);
