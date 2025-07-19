import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import Products from './pages/Product';
import ProductDetailPage from './pages/ProductDetails';
import UserProfile from './pages/UserProfile';
import Admin from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/AdminProfile" element={<AdminProfile />} />
        <Route path="/logout" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
