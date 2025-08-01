import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from "../components/Home/Header";
import Footer from "../shared/Footer";
import Hero from "../components/Home/Hero";
import FeaturedProducts from "../components/Home/FeaturedProducts";
import Testimonials from "../components/Home/Testimonials";
import About from "../components/Home/About";

const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to Products page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('🔄 Redirecting logged-in user to Products page...');
      navigate('/products');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading or redirect if user is logged in
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render Home page for logged-in users (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header, Hero, Featured Products, About, Testimonials, Footer */}
      <Header />
      <Hero />
      <FeaturedProducts />
      <About />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default Home;
