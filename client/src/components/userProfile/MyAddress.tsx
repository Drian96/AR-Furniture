import { useState, useEffect } from 'react';
import { getUserAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, Address, CreateAddressRequest } from '../../services/api';
import { CheckCircle, X, Edit, Trash2 } from 'lucide-react';

const MyAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true); // track success vs error for modal
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<CreateAddressRequest>({
    recipient_name: '',
    phone: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    postal_code: '',
    street_address: '',
    address_type: 'home'
  });
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    postal_code?: string;
    region?: string;
  }>({});

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const fetchedAddresses = await getUserAddresses();
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setFormData({
      recipient_name: '',
      phone: '',
      region: '',
      province: '',
      city: '',
      barangay: '',
      postal_code: '',
      street_address: '',
      address_type: 'home'
    });
    setValidationErrors({});
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setFormData({
      recipient_name: address.recipient_name,
      phone: address.phone || '',
      region: address.region || '',
      province: address.province || '',
      city: address.city || '',
      barangay: address.barangay || '',
      postal_code: address.postal_code || '',
      street_address: address.street_address || '',
      address_type: address.address_type
    });
    setValidationErrors({});
    setShowEditForm(true);
  };

  const handleDeleteAddress = (address: Address) => {
    setSelectedAddress(address);
    setShowDeleteConfirm(true);
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id);
      await loadAddresses(); // Refresh the list
      setSuccessMessage('Default address updated successfully!');
      setIsSuccess(true);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to set default address:', error);
      setSuccessMessage('Failed to update default address. Please try again.');
      setIsSuccess(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const phoneError = validatePhone(formData.phone || '');
    const postalCodeError = validatePostalCode(formData.postal_code || '');
    const regionError = validateRegion(formData.region || '');
    
    const errors: {
      phone?: string;
      postal_code?: string;
      region?: string;
    } = {};
    
    if (phoneError) errors.phone = phoneError;
    if (postalCodeError) errors.postal_code = postalCodeError;
    if (regionError) errors.region = regionError;
    
    setValidationErrors(errors);
    
    // Check if there are any validation errors
    if (phoneError || postalCodeError || regionError) {
      return; // Don't submit if there are errors
    }
    
    try {
      if (showEditForm && selectedAddress) {
        await updateAddress(selectedAddress.id, formData);
        setSuccessMessage('Address updated successfully!');
      } else {
        await createAddress(formData);
        setSuccessMessage('Address added successfully!');
      }
      
      await loadAddresses(); // Refresh the list
      setShowAddForm(false);
      setShowEditForm(false);
      setSelectedAddress(null);
      setValidationErrors({});
      setIsSuccess(true);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to save address:', error);
      setSuccessMessage('Failed to save address. Please try again.');
      setIsSuccess(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAddress) return;
    
    try {
      await deleteAddress(selectedAddress.id);
      await loadAddresses(); // Refresh the list
      setShowDeleteConfirm(false);
      setSelectedAddress(null);
      setSuccessMessage('Address deleted successfully!');
      setIsSuccess(true);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to delete address:', error);
      setSuccessMessage('Failed to delete address. Please try again.');
      setIsSuccess(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  const closeForms = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedAddress(null);
    setFormData({
      recipient_name: '',
      phone: '',
      region: '',
      province: '',
      city: '',
      barangay: '',
      postal_code: '',
      street_address: '',
      address_type: 'home'
    });
    setValidationErrors({});
  };

  // Validation helper functions
  const validatePhone = (value: string | undefined): string | undefined => {
    if (!value) return undefined; // Phone is optional
    if (!/^\d+$/.test(value)) {
      return 'Phone number must contain only numbers';
    }
    if (value.length > 11) {
      return 'Phone number must be 11 digits or less';
    }
    return undefined;
  };

  const validatePostalCode = (value: string | undefined): string | undefined => {
    if (!value) return undefined; // Postal code is optional
    if (!/^\d+$/.test(value)) {
      return 'Postal code must contain only numbers';
    }
    if (value.length > 4) {
      return 'Postal code must be 4 digits or less';
    }
    return undefined;
  };

  const validateRegion = (value: string | undefined): string | undefined => {
    if (!value) return undefined; // Will be caught by required attribute
    if (!/^\d+$/.test(value)) {
      return 'Region must contain only numbers';
    }
    return undefined;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 11) {
      setFormData({ ...formData, phone: value });
      const error = validatePhone(value);
      setValidationErrors({ ...validationErrors, phone: error });
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 4) {
      setFormData({ ...formData, postal_code: value });
      const error = validatePostalCode(value);
      setValidationErrors({ ...validationErrors, postal_code: error });
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData({ ...formData, region: value });
    const error = validateRegion(value);
    setValidationErrors({ ...validationErrors, region: error });
  };

  const getFullAddress = (address: Address) => {
    const parts = [
      address.street_address,
      address.barangay,
      address.city,
      address.province,
      address.region,
      address.postal_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-dgreen">My Addresses</h2>
        <button
          onClick={handleAddAddress}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-lgreen cursor-pointer flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-dgray">Loading addresses...</div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-dgray">No addresses found. Add your first address above.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-lgray rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-dgreen">{address.recipient_name}</h4>
                  <p className="text-dgray mt-1">{getFullAddress(address)}</p>
                  {address.phone && (
                    <p className="text-dgray mt-1">Phone: {address.phone}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {address.is_default && (
                      <span className="inline-block px-3 py-1 bg-lgreen text-dgreen text-sm rounded-full">
                        Default
                      </span>
                    )}
                    <span className="inline-block px-3 py-1 bg-sage-light text-dgreen text-sm rounded-full capitalize">
                      {address.address_type}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleEditAddress(address)}
                    className="text-dgreen hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(address)}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                  {!address.is_default && (
                    <button 
                      onClick={() => handleSetDefault(address)}
                      className="text-dgreen hover:underline cursor-pointer"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-dgreen mb-4">
              {showEditForm ? 'Edit Address' : 'New Address'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  required
                  className="px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
                />
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Phone (11 digits max)"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={11}
                    className={`px-4 py-2 border rounded-lg focus:outline-none ${
                      validationErrors.phone 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-lgray focus:border-dgreen'
                    }`}
                  />
                  {validationErrors.phone && (
                    <span className="text-red-500 text-xs mt-1">{validationErrors.phone}</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Region * (Numbers only)"
                  value={formData.region}
                  onChange={handleRegionChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    validationErrors.region 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-lgray focus:border-dgreen'
                  }`}
                />
                {validationErrors.region && (
                  <span className="text-red-500 text-xs mt-1">{validationErrors.region}</span>
                )}
              </div>
              
              <input
                type="text"
                placeholder="Province *"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                required
                className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
              />
              
              <input
                type="text"
                placeholder="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
              />
              
              <input
                type="text"
                placeholder="Barangay"
                value={formData.barangay}
                onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen"
              />
              
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Postal Code (4 digits max)"
                  value={formData.postal_code}
                  onChange={handlePostalCodeChange}
                  maxLength={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    validationErrors.postal_code 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-lgray focus:border-dgreen'
                  }`}
                />
                {validationErrors.postal_code && (
                  <span className="text-red-500 text-xs mt-1">{validationErrors.postal_code}</span>
                )}
              </div>
              
              <textarea
                placeholder="Street Name, Building, House No. *"
                value={formData.street_address}
                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                required
                className="w-full px-4 py-2 border border-lgray rounded-lg focus:outline-none focus:border-dgreen h-24 resize-none"
              />
              
              <div>
                <p className="text-dgray font-medium mb-2">Label As:</p>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="address_type" 
                      value="home" 
                      checked={formData.address_type === 'home'}
                      onChange={(e) => setFormData({ ...formData, address_type: e.target.value as 'home' | 'work' | 'other' })}
                      className="mr-2 cursor-pointer" 
                    />
                    <span className="text-dgray">Home</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="address_type" 
                      value="work" 
                      checked={formData.address_type === 'work'}
                      onChange={(e) => setFormData({ ...formData, address_type: e.target.value as 'home' | 'work' | 'other' })}
                      className="mr-2 cursor-pointer" 
                    />
                    <span className="text-dgray">Work</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="address_type" 
                      value="other" 
                      checked={formData.address_type === 'other'}
                      onChange={(e) => setFormData({ ...formData, address_type: e.target.value as 'home' | 'work' | 'other' })}
                      className="mr-2 cursor-pointer" 
                    />
                    <span className="text-dgray">Other</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeForms}
                  className="px-4 py-2 border border-lgray text-dgray rounded-lg hover:bg-lgray hover:bg-opacity-20 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-lgreen cursor-pointer"
                >
                  {showEditForm ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAddress && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <h3 className="text-lg font-bold text-dgreen mb-4">Delete Address</h3>
            <p className="text-dgray mb-6">
              Are you sure you want to delete the address for <strong>{selectedAddress.recipient_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-lgray text-dgray rounded-lg hover:bg-lgray hover:bg-opacity-20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal (Success/Error) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                {isSuccess ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <X className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isSuccess ? 'text-dgreen' : 'text-red-600'}`}>
                {isSuccess ? 'Success!' : 'Something went wrong'}
              </h3>
              <p className="text-dgray">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-opacity-90 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddress;