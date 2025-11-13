import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import AppRouter from "./routes/AppRouter.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { ProductProvider } from "./contexts/ProductContext.tsx";
import { OrderProvider } from "./contexts/OrderContext.tsx";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

function RootApp() {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id || "invite"}>
      <AppRouter />
      <Toaster richColors />
    </NotificationProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <OrderProvider>
        <ProductProvider>
          <RootApp />
        </ProductProvider>
      </OrderProvider>
    </AuthProvider>
  </StrictMode>
);
