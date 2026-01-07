import { useMemo, useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, type Product, type NewProductData } from '../../services/api';
import { productService, supabase, PRODUCT_IMAGES_BUCKET, ensureStorageAuth, type ProductImage } from '../../services/supabase';

// Stock management component for admin
// TODO: When backend is connected, fetch real inventory data from your Express API
const AdminViewStocks = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Real data state
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, ProductImage[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Local state for Add Item form (controlled inputs)
  type NewItemForm = {
    name: string;
    code: string;
    category: string;
    supplier: string;
    price: string; // keep as string for controlled input; convert when submitting
    quantity: string; // keep as string
    minStock: string; // keep as string
    description: string;
    images: File[]; // selected image files
  };

  const [newItemForm, setNewItemForm] = useState<NewItemForm>({
    name: '',
    code: '',
    category: '',
    supplier: '',
    price: '',
    quantity: '',
    minStock: '',
    description: '',
    images: []
  });

  // Basic validation error messages
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit form state (similar to Add form)
  const [editForm, setEditForm] = useState<NewItemForm>({
    name: '',
    code: '',
    category: '',
    supplier: '',
    price: '',
    quantity: '',
    minStock: '',
    description: '',
    images: []
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  // Track images the user marked for deletion during this edit session
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  // Derived previews for images
  const imagePreviews = useMemo(() => {
    return newItemForm.images.map((file) => URL.createObjectURL(file));
  }, [newItemForm.images]);

  const editImagePreviews = useMemo(() => {
    return editForm.images.map((file) => URL.createObjectURL(file));
  }, [editForm.images]);

  // Fetch products from backend API and images from Supabase
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      
      // Fetch images for each product from Supabase
      const imagesMap: Record<string, ProductImage[]> = {};
      for (const product of fetchedProducts) {
        try {
          const images = await productService.getProductImages(product.id.toString());
          imagesMap[product.id] = images;
        } catch (error) {
          console.error(`Failed to fetch images for product ${product.id}:`, error);
          imagesMap[product.id] = [];
        }
      }
      setProductImages(imagesMap);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const resetAddForm = () => {
    setNewItemForm({
      name: '',
      code: '',
      category: '',
      supplier: '',
      price: '',
      quantity: '',
      minStock: '',
      description: '',
      images: []
    });
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      code: '',
      category: '',
      supplier: '',
      price: '',
      quantity: '',
      minStock: '',
      description: '',
      images: []
    });
    setEditFormErrors({});
  };

  const validateAddForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newItemForm.name.trim()) errors.name = 'Product name is required';
    if (!newItemForm.category.trim()) errors.category = 'Category is required';
    if (!newItemForm.supplier.trim()) errors.supplier = 'Supplier is required';
    if (!newItemForm.price.trim() || Number(newItemForm.price) < 0) errors.price = 'Enter a valid price';
    if (!newItemForm.quantity.trim() || Number(newItemForm.quantity) < 0) errors.quantity = 'Enter a valid quantity';
    if (newItemForm.minStock && Number(newItemForm.minStock) < 0) errors.minStock = 'Must be 0 or greater';
    // Images optional; you can require at least 1 if desired
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editForm.name.trim()) errors.name = 'Product name is required';
    if (!editForm.category.trim()) errors.category = 'Category is required';
    if (!editForm.supplier.trim()) errors.supplier = 'Supplier is required';
    if (!editForm.price.trim() || Number(editForm.price) < 0) errors.price = 'Enter a valid price';
    if (!editForm.quantity.trim() || Number(editForm.quantity) < 0) errors.quantity = 'Enter a valid quantity';
    if (editForm.minStock && Number(editForm.minStock) < 0) errors.minStock = 'Must be 0 or greater';
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setNewItemForm((prev) => ({ ...prev, images: [...prev.images, ...fileArray] }));
  };

  const handleEditImageChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setEditForm((prev) => ({ ...prev, images: [...prev.images, ...fileArray] }));
  };

  const removeImageAtIndex = (index: number) => {
    setNewItemForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeEditImageAtIndex = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };


  // Calculate real inventory stats from products
  const inventoryStats = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStockItems = products.filter(product => product.quantity <= product.min_stock && product.quantity > 0).length;
    const outOfStockItems = products.filter(product => product.quantity === 0).length;
    
    return {
      totalInventoryValue: `₱${totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      lowStockItems: lowStockItems.toString(),
      outOfStockItems: outOfStockItems.toString()
    };
  }, [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All Status' || product.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pagedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);
  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(next);
  };

  // Create new product
  const handleAddItem = async (formData: NewProductData, imageFiles: File[]) => {
    try {
      setIsSubmitting(true);
      console.log('Adding new item:', formData);
      
      // Create product via backend API
      const result = await createProduct(formData);
      console.log('✅ Product created successfully:', result);
      
      // If there are images, upload them to Supabase
      if (imageFiles.length > 0) {
        try {
          await ensureStorageAuth();
          await productService.uploadProductImages(result.id.toString(), imageFiles, 0);
          console.log('✅ Images uploaded successfully');
        } catch (imageError) {
          console.error('❌ Failed to upload images:', imageError);
          // Don't fail the entire operation if image upload fails
        }
      }
      
      // Close modals and reset form
      setShowAddItemModal(false);
      setShowAddConfirm(false);
      resetAddForm();
      
      // Refresh the products list to show the new item
      await fetchProducts();
      
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit item functionality
  const handleEditItem = (item: Product) => {
    setSelectedItem(item);
    setRemovedImageIds([]);
    // Pre-populate edit form with item data
    setEditForm({
      name: item.name,
      code: item.code || '',
      category: item.category,
      supplier: item.supplier,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      minStock: item.min_stock.toString(),
      description: item.description || '',
      images: [] // New images to add
    });
    setEditFormErrors({});
    setShowEditItemModal(true);
  };

  const handleDeleteItem = (item: Product) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await deleteProduct(selectedItem.id);
      console.log('✅ Product deleted successfully');
      
      // Refresh the products list
      await fetchProducts();
      
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleUpdateItem = async (formData: NewProductData, imageFiles: File[]) => {
    if (!selectedItem) return;
    
    try {
      setIsUpdating(true);
      
      // Update product data via backend API
      const updatedProduct = await updateProduct(selectedItem.id, formData);
      
      // If there are new images, upload them to Supabase
      if (imageFiles.length > 0) {
        try {
          const existingImages = productImages[selectedItem.id] || [];
          await ensureStorageAuth();
          await productService.uploadProductImages(selectedItem.id.toString(), imageFiles, existingImages.length);
          console.log('✅ New images uploaded successfully');
        } catch (imageError) {
          console.error('❌ Failed to upload new images:', imageError);
          // Don't fail the entire operation if image upload fails
        }
      }

      // Apply deletions for images flagged during edit
      if (removedImageIds.length > 0) {
        try {
          const imagesToDelete = (productImages[selectedItem.id] || []).filter(img => removedImageIds.includes(img.id));
          for (const img of imagesToDelete) {
            await productService.deleteProductImage(img);
          }
          console.log('✅ Removed images deleted successfully');
        } catch (imageError) {
          console.error('❌ Failed to delete removed images:', imageError);
          // Don't fail the entire operation if image deletion fails
        }
      }
      
      console.log('✅ Product updated successfully');
      
      // Refresh the products list
      await fetchProducts();
      
      setShowEditItemModal(false);
      setShowUpdateConfirm(false);
      setSelectedItem(null);
      setRemovedImageIds([]);
      resetEditForm();
      
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dgreen">Stock Management</h1>
          <p className="text-dgray mt-1">Manage your inventory and stock levels</p>
        </div>
        <button 
          onClick={() => setShowAddItemModal(true)}
          className="bg-dgreen text-cream px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>

      {/* Inventory Overview Cards */}
      {/* TODO: When backend is ready, these will update in real-time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Total Inventory Value</h3>
          <p className="text-2xl font-bold text-dgreen">{inventoryStats.totalInventoryValue}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Low Stock Items</h3>
          <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStockItems}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
          <h3 className="text-sm font-medium text-dgray mb-2">Out of Stock Items</h3>
          <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      {/* TODO: When backend is ready, implement real search and filtering */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-sage-light">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dgray w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, SKU or supplier"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All Categories</option>
            <option>Seating</option>
            <option>Storage</option>
            <option>Tables</option>
            <option>Beds</option>
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
          >
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        {/* Stock Items Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-dgray">Loading products...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-dgray">No products found</div>
            </div>
          ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-sage-light">
                <th className="text-left py-3 px-4 font-medium text-dgreen">Name</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Category</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Supplier</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Price</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Status</th>
                <th className="text-left py-3 px-4 font-medium text-dgreen">Actions</th>
              </tr>
            </thead>
            <tbody>
                {pagedProducts.map((item) => (
                <tr key={item.id} className="border-b border-sage-light hover:bg-cream">
                  <td className="py-3 px-4 text-dgreen font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-dgray">{item.code || 'N/A'}</td>
                  <td className="py-3 px-4 text-dgray">{item.category}</td>
                  <td className="py-3 px-4 text-dgray">{item.supplier}</td>
                  <td className="py-3 px-4 text-dgray">{item.quantity}</td>
                    <td className="py-3 px-4 text-dgreen font-medium">₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'Low Stock' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-800"
                          title="Edit product"
                      >
                        <Edit className="w-4 h-4 cursor-pointer hover:scale-120" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-800"
                          title="Delete product"
                      >
                        <Trash2 className="w-4 h-4 cursor-pointer hover:scale-120" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        {/* Pagination Controls */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className={`px-4 py-2 rounded-lg border cursor-pointer ${safeCurrentPage <= 1 ? 'text-gray-400 border-gray-200' : 'text-dgreen border-dgreen hover:bg-dgreen hover:text-white'}`}
            >
              Previous
            </button>
            <span className="text-dgray">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className={`px-4 py-2 rounded-lg border cursor-pointer ${safeCurrentPage >= totalPages ? 'text-gray-400 border-gray-200' : 'text-dgreen border-dgreen hover:bg-dgreen hover:text-white'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add New Item Modal */}
      {/* TODO: When backend is ready, implement actual form submission */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Add New Stock Item</h2>
              <button 
                onClick={() => { setShowAddItemModal(false); resetAddForm(); }}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Product Name *</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm((p) => ({ ...p, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${formErrors.name ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Product Code</label>
                  <input
                    type="text"
                    placeholder="Product code"
                    value={newItemForm.code}
                    onChange={(e) => setNewItemForm((p) => ({ ...p, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Category *</label>
                  <select 
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm((p) => ({ ...p, category: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${formErrors.category ? 'border-red-400' : 'border-sage-light'}`}
                  >
                    <option value="">Select category</option>
                    <option>Seating</option>
                    <option>Storage</option>
                    <option>Tables</option>
                    <option>Beds</option>
                  </select>
                  {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Supplier *</label>
                  <input
                    type="text"
                    placeholder="Enter supplier name"
                    value={newItemForm.supplier}
                    onChange={(e) => setNewItemForm((p) => ({ ...p, supplier: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${formErrors.supplier ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {formErrors.supplier && <p className="text-xs text-red-600 mt-1">{formErrors.supplier}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm((p) => ({ ...p, price: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${formErrors.price ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Quantity *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItemForm.quantity}
                    onChange={(e) => setNewItemForm((p) => ({ ...p, quantity: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${formErrors.quantity ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {formErrors.quantity && <p className="text-xs text-red-600 mt-1">{formErrors.quantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  placeholder="10"
                  value={newItemForm.minStock}
                  onChange={(e) => setNewItemForm((p) => ({ ...p, minStock: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${formErrors.minStock ? 'border-red-400' : 'border-sage-light'}`}
                />
                {formErrors.minStock && <p className="text-xs text-red-600 mt-1">{formErrors.minStock}</p>}
              </div>


              {/* Images upload */}
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange(e.target.files)}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sage-light file:text-dgreen"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded border border-sage-light" />
                        <button
                          type="button"
                          onClick={() => removeImageAtIndex(idx)}
                          className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Product description..."
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddItemModal(false); resetAddForm(); }}
                  className="flex-1 px-4 py-2 border border-lgreen text-dgray rounded-lg hover:border-dgreen cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (validateAddForm()) {
                      setShowAddConfirm(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-lgreen cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dgreen">Edit Stock Item</h2>
              <button 
                onClick={() => { setShowEditItemModal(false); resetEditForm(); }}
                className="text-dgray hover:text-dgreen"
              >
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter product name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${editFormErrors.name ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {editFormErrors.name && <p className="text-xs text-red-600 mt-1">{editFormErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Product Code</label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="Product code"
                    className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Category *</label>
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${editFormErrors.category ? 'border-red-400' : 'border-sage-light'}`}
                  >
                    <option value="">Select category</option>
                    <option>Seating</option>
                    <option>Storage</option>
                    <option>Tables</option>
                    <option>Beds</option>
                  </select>
                  {editFormErrors.category && <p className="text-xs text-red-600 mt-1">{editFormErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Supplier *</label>
                  <input
                    type="text"
                    value={editForm.supplier}
                    onChange={(e) => setEditForm((p) => ({ ...p, supplier: e.target.value }))}
                    placeholder="Enter supplier name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${editFormErrors.supplier ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {editFormErrors.supplier && <p className="text-xs text-red-600 mt-1">{editFormErrors.supplier}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${editFormErrors.price ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {editFormErrors.price && <p className="text-xs text-red-600 mt-1">{editFormErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${editFormErrors.quantity ? 'border-red-400' : 'border-sage-light'}`}
                  />
                  {editFormErrors.quantity && <p className="text-xs text-red-600 mt-1">{editFormErrors.quantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  value={editForm.minStock}
                  onChange={(e) => setEditForm((p) => ({ ...p, minStock: e.target.value }))}
                  placeholder="10"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen ${editFormErrors.minStock ? 'border-red-400' : 'border-sage-light'}`}
                />
                {editFormErrors.minStock && <p className="text-xs text-red-600 mt-1">{editFormErrors.minStock}</p>}
              </div>


              {/* Existing Images Display */}
              {productImages[selectedItem.id] && productImages[selectedItem.id].length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-dgreen mb-1">Current Images</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {productImages[selectedItem.id]
                      .filter((img) => !removedImageIds.includes(img.id))
                      .map((image, idx) => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={image.image_url} 
                          alt={`Product ${idx + 1}`} 
                          className="w-full h-24 object-cover rounded border border-sage-light" 
                        />
                        {image.is_primary && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">Primary</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setRemovedImageIds((prev) => [...prev, image.id])}
                          className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Add New Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleEditImageChange(e.target.files)}
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sage-light file:text-dgreen cursor-pointer"
                />
                {editImagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {editImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded border border-sage-light" />
                        <button
                          type="button"
                          onClick={() => removeEditImageAtIndex(idx)}
                          className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dgreen mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Product description..."
                  className="w-full px-3 py-2 border border-sage-light rounded-lg focus:outline-none focus:ring-2 focus:ring-dgreen"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditItemModal(false); resetEditForm(); }}
                  className="flex-1 px-4 py-2 border border-dgreen text-dgray rounded-lg hover:border-lgreen cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (validateEditForm()) {
                      setShowUpdateConfirm(true);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-dgreen text-cream rounded-lg hover:bg-lgreen cursor-pointer"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Delete Item</h3>
              <p className="text-dgray">
                Are you sure you want to delete <span className="font-medium">{selectedItem.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-dgreen text-dgray rounded-lg hover:border-lgreen cursor-pointer"
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

      {/* Add Item Confirmation Modal */}
      {showAddConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Confirm Add Item</h3>
              <p className="text-dgray">
                Are you sure you want to add <span className="font-medium">{newItemForm.name || 'this item'}</span> to inventory?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddConfirm(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Prepare payload for submission
                  const payload: NewProductData = {
                    name: newItemForm.name,
                    code: newItemForm.code || undefined,
                    category: newItemForm.category,
                    supplier: newItemForm.supplier,
                    price: Number(newItemForm.price),
                    quantity: Number(newItemForm.quantity),
                    min_stock: newItemForm.minStock ? Number(newItemForm.minStock) : 0,
                    description: newItemForm.description || undefined
                  };
                  await handleAddItem(payload, newItemForm.images);
                }}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-dgreen text-cream hover:bg-opacity-90'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Item Confirmation Modal */}
      {showUpdateConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-dgreen mb-2">Confirm Update Item</h3>
              <p className="text-dgray">
                Are you sure you want to update <span className="font-medium">{editForm.name || selectedItem.name}</span>?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpdateConfirm(false)}
                className="flex-1 px-4 py-2 border border-sage-light text-dgray rounded-lg hover:bg-sage-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Prepare payload for submission
                  const payload: NewProductData = {
                    name: editForm.name,
                    code: editForm.code || undefined,
                    category: editForm.category,
                    supplier: editForm.supplier,
                    price: Number(editForm.price),
                    quantity: Number(editForm.quantity),
                    min_stock: editForm.minStock ? Number(editForm.minStock) : 0,
                    description: editForm.description || undefined
                  };
                  await handleUpdateItem(payload, editForm.images);
                }}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isUpdating 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-dgreen text-cream hover:bg-opacity-90'
                }`}
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewStocks;