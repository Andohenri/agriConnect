import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PublicRoute from './PublicRoute';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/dashboard/Dashboard';
import Analytics from '../pages/analytics/Analytics';
import Products from '../pages/products/Products';
import Orders from '../pages/orders/Orders';
import MapView from '../pages/map/Map';
import Messages from '../pages/messages/Messages';

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><SignUp /></PublicRoute>} />

      {/* Routes privées avec Layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="products">
          <Route index element={<Products />} />
          {/* <Route path=":id" element={<ProductDetail />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="edit/:id" element={<AddProduct />} /> */}
        </Route>
        <Route path="orders">
          <Route index element={<Orders />} />
          {/* <Route path=":id" element={<OrderDetail />} /> */}
        </Route>
        <Route path="map" element={<MapView />} />
        <Route path="messages" element={<Messages />} />

        {/*  <Route path="profile" element={<Profile />} /> */}
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;