
import { useSearchParams } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import ProductDashboard from '../components/Products/ProductDashboard';

const Products = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <ProductDashboard searchQuery={searchQuery} />
      <Footer />
    </div>
  );
};

export default Products;
