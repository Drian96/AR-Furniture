import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserAddresses, Address, createOrder, type CreateOrderRequest, type OrderItem } from '../services/api';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

const Checkout = () => {
  const { items: cartItems, totalPrice: total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Address and form states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Load user addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const userAddresses = await getUserAddresses();
        setAddresses(userAddresses);
        
        // Set default address if available
        const defaultAddress = userAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Validation helper functions
  const validatePhone = (value: string | undefined): string | undefined => {
    if (!value) return 'Phone number is required';
    if (!/^\d+$/.test(value)) {
      return 'Phone number must contain only numbers';
    }
    if (value.length > 11) {
      return 'Phone number must be 11 digits or less';
    }
    return undefined;
  };

  const validatePostalCode = (value: string | undefined): string | undefined => {
    if (!value) return 'Postal code is required';
    if (!/^\d+$/.test(value)) {
      return 'Postal code must contain only numbers';
    }
    if (value.length > 4) {
      return 'Postal code must be 4 digits or less';
    }
    return undefined;
  };

  // Handle phone number change with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 11) {
      setFormData(prev => ({
        ...prev,
        phone: value
      }));
      const error = validatePhone(value);
      setErrors(prev => ({
        ...prev,
        phone: error || ''
      }));
    }
  };

  // Handle postal code change with validation
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 4) {
      setFormData(prev => ({
        ...prev,
        postalCode: value
      }));
      const error = validatePostalCode(value);
      setErrors(prev => ({
        ...prev,
        postalCode: error || ''
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Skip special handlers for phone and postalCode
    if (name === 'phone') {
      handlePhoneChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    if (name === 'postalCode') {
      handlePostalCodeChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // If using saved address, validate selection
    if (!useNewAddress) {
      if (!selectedAddress) {
        newErrors.address = 'Please select a delivery address';
        setErrors(newErrors);
        return false;
      }
      return true;
    }
    
    // If using new address, validate form fields
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (numbers only, max 11)
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }
    
    // Postal code validation (numbers only, max 4)
    const postalCodeError = validatePostalCode(formData.postalCode);
    if (postalCodeError) {
      newErrors.postalCode = postalCodeError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create order data
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Use selected address or form data
      const deliveryInfo = useNewAddress ? {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        notes: formData.notes
      } : {
        // Split recipient_name into first and last name (if it contains a space, otherwise use full name as first name)
        first_name: selectedAddress!.recipient_name.split(' ')[0] || selectedAddress!.recipient_name,
        last_name: selectedAddress!.recipient_name.includes(' ') 
          ? selectedAddress!.recipient_name.split(' ').slice(1).join(' ') 
          : user.lastName || 'Customer', // Fallback to user's last name or default
        email: user.email,
        phone: selectedAddress!.phone || user.phone || '',
        address: `${selectedAddress!.street_address}, ${selectedAddress!.barangay}, ${selectedAddress!.city}, ${selectedAddress!.province}, ${selectedAddress!.region}`,
        city: selectedAddress!.city || '',
        postal_code: selectedAddress!.postal_code || '',
        notes: formData.notes
      };
      
      const orderData: CreateOrderRequest = {
        user_id: user.id,
        total_amount: total,
        first_name: deliveryInfo.first_name,
        last_name: deliveryInfo.last_name,
        email: deliveryInfo.email,
        phone: deliveryInfo.phone,
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        postal_code: deliveryInfo.postal_code,
        notes: deliveryInfo.notes || '',
        payment_method: 'cash_on_delivery',
        items: cartItems.map((item: any) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Create order in database
      const order = await createOrder(orderData);
      setOrderId(order.order_number);
      
      // Clear cart after successful order
      clear();
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is successful, show confirmation
  if (orderId) {
    return (
      <div className="bg-cream min-h-screen">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-4">Your order has been received and is being processed.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">{orderId}</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                We'll send you an email confirmation shortly. Your order will be delivered within 3-5 business days.
              </p>
              <p className="text-sm text-gray-500">
                Payment method: Cash on Delivery
              </p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-dgreen text-white rounded-lg hover:bg-dgreen/90 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-dgreen text-dgreen rounded-lg hover:bg-dgreen hover:text-white transition-colors"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
            
            {/* Address Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Delivery Address</h3>
              
              {/* Saved Addresses */}
              {loadingAddresses ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-dgreen"></div>
                  <p className="mt-2 text-gray-600">Loading addresses...</p>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-dgreen bg-green-50'
                          : 'border-gray-300 hover:border-dgreen'
                      }`}
                      onClick={() => {
                        setSelectedAddress(address);
                        setUseNewAddress(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{address.recipient_name}</h4>
                            {address.is_default && (
                              <span className="px-2 py-1 bg-dgreen text-white text-xs rounded-full">
                                Default
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                              {address.address_type}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {address.street_address}, {address.barangay}, {address.city}, {address.province}, {address.region}
                          </p>
                          {address.phone && (
                            <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?.id === address.id}
                          onChange={() => {
                            setSelectedAddress(address);
                            setUseNewAddress(false);
                          }}
                          className="h-4 w-4 text-dgreen focus:ring-dgreen"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  <p>No saved addresses found.</p>
                  <p className="text-sm">You can add addresses in your profile.</p>
                </div>
              )}
              
              {/* New Address Option */}
              <div className="border-t pt-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    useNewAddress
                      ? 'border-dgreen bg-green-50'
                      : 'border-gray-300 hover:border-dgreen'
                  }`}
                  onClick={() => setUseNewAddress(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Use New Address</h4>
                      <p className="text-gray-600 text-sm">Enter a new delivery address</p>
                    </div>
                    <input
                      type="radio"
                      name="address"
                      checked={useNewAddress}
                      onChange={() => setUseNewAddress(true)}
                      className="h-4 w-4 text-dgreen focus:ring-dgreen"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Show form fields only when using new address */}
              {useNewAddress && (
                <>
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number * (11 digits max)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={11}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              
              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your complete delivery address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code * (4 digits max)
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    maxLength={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter postal code"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>
                </>
              )}
              
              {/* Delivery Notes - Always show */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dgreen focus:border-dgreen"
                  placeholder="Any special delivery instructions..."
                />
              </div>
              
              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-4 border-2 border-dgreen rounded-lg bg-green-50">
                    <input
                      type="radio"
                      id="cash_on_delivery"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      defaultChecked
                      className="h-4 w-4 text-dgreen focus:ring-dgreen border-gray-300"
                    />
                    <label htmlFor="cash_on_delivery" className="ml-3 block text-sm font-medium text-gray-900">
                      Cash on Delivery
                    </label>
                  </div>
                  
                  <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                    <input
                      type="radio"
                      id="online_payment"
                      name="paymentMethod"
                      value="online_payment"
                      disabled
                      className="h-4 w-4 text-gray-400 border-gray-300"
                    />
                    <label htmlFor="online_payment" className="ml-3 block text-sm font-medium text-gray-500">
                      Online Payment (Coming Soon)
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-dgreen text-white py-3 px-4 rounded-lg font-semibold hover:bg-dgreen/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Processing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center space-x-4">
                  <img
                    src={item.imageUrl || '/placeholder-image.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm font-semibold text-dgreen">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Payment: Cash on Delivery
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
