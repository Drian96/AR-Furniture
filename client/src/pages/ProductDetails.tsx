
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import ProductDetail from '../components/Products/ProductDetail';

const ProductDetailPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <ProductDetail />
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
