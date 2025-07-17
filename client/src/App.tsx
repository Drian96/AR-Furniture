import { Routes, Route } from 'react-router-dom';
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

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/AdminProfile" element={<AdminProfile />} />

      <Route path="*" element={<NotFound />} />
    </Routes>

  );
}

export default App
