import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";

import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";

import Layout from "../components/layout/Layout";
import Dashboard from "../pages/dashboard/Dashboard";
import Analytics from "../pages/analytics/Analytics";
import Products from "../pages/products/Products";
import Orders from "../pages/orders/Orders";
import MapView from "../pages/map/Map";
import Messages from "../pages/messages/Messages";
import ProductDetail from "@/pages/products/ProductDetails";
import AddProduct from "@/pages/products/AddProduct";
import Profile from "@/pages/profile/Profile";
import OrderDetails from "@/pages/orders/OrderDetails";
import AdminRoute from "./AdminRoute";


// ✅ Loader pour afficher le spinner pendant l’auth

const product = { id: 3, nom: 'Haricots Secs', type: 'Légumineuse', sous_type: 'Sec', quantite_disponible: 200, unite: 'kg', prix_unitaire: 3200, date_recolte: '2025-01-18', image: '🫘', localisation: 'Analamanga', latitude: -18.95, longitude: 47.52, paysan: 'Paul Randria', telephone: '032 55 444 33', description: 'Haricots secs de première qualité', certification: '', statut: 'disponible' };


const router = createBrowserRouter([
  // ✅ Routes publiques
  {
    path: "/sign-in",
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <PublicRoute>
        <SignUp />
      </PublicRoute>
    ),
  },

  // ✅ Routes privées avec Layout
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "analytics", element: <Analytics /> },

      {
        path: "products",
        children: [
          { index: true, element: <Products /> },
          { path: ":id", element: <ProductDetail product={product} /> },
          { path: "add", element: <AddProduct /> },
          { path: "edit/:id", element: <AddProduct /> },
        ],
      },

      {
        path: "orders",
        children: [
          { index: true, element: <Orders /> },
          { path:":id", element: <OrderDetails /> }
        ],
      },

      { path: "map", element: <MapView /> },
      { path: "messages", element: <Messages /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  // ✅ Routes privées admin avec Layout
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Layout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "analytics", element: <Analytics /> },

      {
        path: "products",
        children: [
          { index: true, element: <Products /> },
          { path: ":id", element: <ProductDetail product={product} /> },
          { path: "add", element: <AddProduct /> },
          { path: "edit/:id", element: <AddProduct /> },
        ],
      },

      {
        path: "orders",
        children: [
          { index: true, element: <Orders /> },
          // { path=":id", element: <OrderDetail /> }
        ],
      },

      { path: "map", element: <MapView /> },
      { path: "messages", element: <Messages /> },
      { path: "profile", element: <Profile /> },
    ],
  },

  // ✅ Catch-all → Redirection 404
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
