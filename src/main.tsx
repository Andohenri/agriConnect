import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import AppRouter from "./routes/AppRouter.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ProductProvider } from "./contexts/ProductContext.tsx";
import { Toaster } from "sonner";
import { OrderProvider } from "./contexts/OrderContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <OrderProvider>
        <ProductProvider>
          <AppRouter />
          <Toaster />
        </ProductProvider>
      </OrderProvider>
    </AuthProvider>
  </StrictMode>
);
