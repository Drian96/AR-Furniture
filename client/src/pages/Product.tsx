import { useSearchParams } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import ProductDashboard from '../components/Products/ProductDashboard';

const Products = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const initialPage = Number.parseInt(searchParams.get('page') || '1', 10) || 1;

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <ProductDashboard searchQuery={searchQuery} initialPage={initialPage} />
      <Footer />
    </div>
  );
};

export default Products;