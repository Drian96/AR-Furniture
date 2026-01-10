import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

const CartPage = () => {
  const { items, totalPrice, updateQuantity, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const handleQuantityInput = (productId: string, value: string) => {
    if (value === '') {
      updateQuantity(productId, 1);
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      updateQuantity(productId, 1);
    } else {
      updateQuantity(productId, numValue);
    }
  };

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
                <div key={it.productId} className="bg-white rounded-lg p-3 sm:p-4 border border-sage-light">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Left: Image, Name, Price */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sage-light rounded overflow-hidden flex-shrink-0">
                        {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-dgreen font-semibold text-sm sm:text-base truncate">{it.name}</div>
                        <div className="text-dgray text-xs sm:text-sm">₱{it.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>

                    {/* Middle: Quantity and Total */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="flex items-center border border-sage-light rounded">
                        <button 
                          onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))} 
                          className="px-2 sm:px-3 py-1 text-dgreen hover:bg-lgreen hover:text-cream transition-colors text-sm sm:text-base"
                          type="button"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleQuantityInput(it.productId, e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                              updateQuantity(it.productId, 1);
                            }
                          }}
                          className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-center font-medium border-0 focus:outline-none focus:ring-0 text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          onClick={() => updateQuantity(it.productId, it.quantity + 1)} 
                          className="px-2 sm:px-3 py-1 text-dgreen hover:bg-lgreen hover:text-cream transition-colors text-sm sm:text-base"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right text-dgreen font-semibold text-xs sm:text-sm min-w-[70px] sm:min-w-[90px]">
                        <div className="text-xs text-dgray sm:hidden mb-0.5">Total</div>
                        ₱{(it.price * it.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Right: Delete Icon */}
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => removeItem(it.productId)} 
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 hover:scale-120 transition-transform" />
                      </button>
                    </div>
                  </div>
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


