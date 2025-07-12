
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import ProductDashboard from '../components/Products/ProductDashboard';

const Products = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <ProductDashboard />
      <Footer />
    </div>
  );
};

export default Products;
