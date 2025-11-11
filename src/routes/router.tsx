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
import AdminDashboard from "@/pages/admin/dashboard/Dashbord";
import AdminAnalytics from "@/pages/admin/analytics/Analytics";
import AdminMapView from "@/pages/admin/map/Map";
import AdminOrders from "@/pages/admin/orders/Orders";
import AdminOrderDetails from "@/pages/admin/orders/OrderDetails";
import AdminProducts from "@/pages/admin/products/Products";
import AdminProductDetail from "@/pages/admin/products/ProductDetails";
import Users from "@/pages/admin/users/Users";

// ✅ Loader pour afficher le spinner pendant l’auth

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
          { path: ":id", element: <ProductDetail/> },
          { path: "add", element: <AddProduct /> },
          { path: "edit/:id", element: <AddProduct /> },
        ],
      },

      {
        path: "orders",
        children: [
          { index: true, element: <Orders /> },
          { path: ":id", element: <OrderDetails /> },
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
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "analytics", element: <AdminAnalytics/> },

      {
        path: "products",
        children: [
          { index: true, element: <AdminProducts/> },
          { path: ":id", element: <AdminProductDetail /> },
        ],
      },

      {
        path: "orders",
        children: [
          { index: true, element: <AdminOrders/> },
          { path: ":id", element: <AdminOrderDetails/> },
        ],
      },

      { path: "map", element: <AdminMapView /> },
      { path: "Users", element: <Users /> },
    ],
  },

  // ✅ Catch-all → Redirection 404
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
