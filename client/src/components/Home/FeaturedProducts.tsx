
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const FeaturedProducts = () => {
  const { isAuthenticated } = useAuth();

  const handleProductClick = (productId: number) => {
    if (isAuthenticated) {
      // If logged in, navigate to product detail
      window.location.href = `/product/${productId}`;
    } else {
      // If not logged in, redirect to login page
      window.location.href = '/login';
    }
  };
  const products = [
    {
      id: 1,
      name: "Modern Oak Dining Table",
      price: "PHP 4,299",
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Dining"
    },
    {
      id: 2,
      name: "Comfort Lounge Chair",
      price: "PHP 3,499",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Living Room"
    },
    {
      id: 3,
      name: "Minimalist Bookshelf",
      price: "PHP 2,199",
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Storage"
    },
    {
      id: 4,
      name: "Elegant Coffee Table",
      price: "PHP 3,499",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      category: "Living Room"
    }
  ];

  return (
    <section id="products" className="bg-white section-padding m-5">
      <div className="max-w-7xl mx-auto ">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-serif font-bold text-sage-dark mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked pieces that embody our commitment to quality, sustainability, and timeless design
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    <div className="absolute top-4 left-4">
                    <span className="bg-sage-medium text-sage-dark px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-sage-dark mb-2 group-hover:text-sage-medium transition-colors">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-sage-dark">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 mb-10">
          <Link to="/products" className="bg-lgreen text-lg px-10 py-4 hover:bg-dgreen transition-colors duration-300 rounded-lg cursor-pointer inline-block">
            View All Products
          </Link>
        </div>


      </div>
    </section>
  );
};

export default FeaturedProducts;
