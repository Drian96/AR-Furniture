import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Products from './pages/Product';
import ProductDetailPage from './pages/ProductDetails';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import Admin from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminSystemSettingsPage from './pages/AdminSystemSettings';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Customer protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer", "admin", "manager", "staff"]} />}> 
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Admin area: allow admin, manager, staff */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]} />}> 
          <Route path="/admin" element={<Admin />} />
          <Route path="/AdminProfile" element={<AdminProfile />} />
        </Route>

        {/* System settings: admin only */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}> 
          <Route path="/admin/system-settings" element={<AdminSystemSettingsPage />} />
        </Route>

        <Route path="/logout" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
