import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

const CartPage = () => {
  const { items, totalPrice, updateQuantity, removeItem, clear } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">

      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-dgreen mb-6">My Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-dgray mb-4">Your cart is empty.</p>
            <Link to="/products" className="inline-block bg-dgreen text-cream px-6 py-3 rounded-lg hover:bg-lgreen">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <div key={it.productId} className="bg-white rounded-lg p-4 flex items-center gap-4 border border-sage-light">
                  <div className="w-20 h-20 bg-sage-light rounded overflow-hidden">
                    {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="text-dgreen font-semibold">{it.name}</div>
                    <div className="text-dgray text-sm">₱{it.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))} className="px-3 py-1 border rounded">-</button>
                    <span className="min-w-8 text-center">{it.quantity}</span>
                    <button onClick={() => updateQuantity(it.productId, it.quantity + 1)} className="px-3 py-1 border rounded">+</button>
                  </div>
                  <div className="w-28 text-right text-dgreen font-semibold">₱{(it.price * it.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  <button onClick={() => removeItem(it.productId)} className="text-red-600 hover:text-red-800 cursor-pointer">Remove</button>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 h-max border border-sage-light">
              <h2 className="text-xl font-bold text-dgreen mb-4">Order Summary</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-dgray">Subtotal</span>
                <span className="text-dgreen font-semibold">₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-dgreen text-cream px-6 py-3 rounded-lg hover:bg-lgreen mb-3 cursor-pointer"
              >
                Proceed to Checkout
              </button>
              <button onClick={clear} className="w-full border border-sage-light text-dgray px-6 py-3 rounded-lg hover:bg-sage-light cursor-pointer">Clear Cart</button>
            </div>
          </div>
        )}
      </div>

      <Footer />
      
    </div>
  );
};

export default CartPage;


