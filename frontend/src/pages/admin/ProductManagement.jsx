import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import JsBarcode from 'jsbarcode';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    // Check if redirected from dashboard to add product
    if (searchParams.get('action') === 'add') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get products
      const productsResponse = await api.get('/products');
      console.log('Products response:', productsResponse.data);  // Debug log
      setProducts(productsResponse.data.data);
      
      // Get categories  
      const categoriesResponse = await api.get('/products/categories/list');
      console.log('Categories response:', categoriesResponse.data);
      setCategories(categoriesResponse.data.data);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Product Form Component
  const AddProductForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      category_id: '',
      price: '',
      cost: '',
      stock: '',
      min_stock: 5,
      image: null,
      description: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        
        setFormData({...formData, image: file});
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const stock = parseInt(formData.stock) || 0;
        const autoMinStock = Math.max(1, Math.floor(stock * 0.1));

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('category_id', parseInt(formData.category_id));
        submitData.append('price', parseFloat(formData.price));
        submitData.append('cost', parseFloat(formData.cost) || 0);
        submitData.append('stock', stock);
        submitData.append('min_stock', autoMinStock);
        submitData.append('description', formData.description);
        
        if (formData.image) {
          submitData.append('image', formData.image);
        }
        
        await api.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        alert(`Product added successfully!\n\nStock: ${stock}\nAuto Min Stock: ${autoMinStock}`);
        setShowAddForm(false);
        fetchData();
        navigate('/admin/products');
        
      } catch (error) {
        alert('Failed to add product: ' + (error.response?.data?.error || error.message));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="rounded-lg shadow-lg p-6 mb-6" style={{ backgroundColor: '#F7E9A0' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#3E3E3E' }}>Add New Product</h2>
          <button 
            onClick={() => {
              setShowAddForm(false);
              navigate('/admin/products');
            }}
            className="text-2xl font-bold hover:opacity-70"
            style={{ color: '#3E3E3E' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Product Name ONLY - HAPUS Barcode Section */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Product Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
              style={{ 
                borderColor: '#E9C46A',
                backgroundColor: '#FFFCF2',
                color: '#3E3E3E'
              }}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter product name"
            />
          </div>

          {/* Row 2: Category & Image Upload - sekarang jadi Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Category *</label>
              <select
                required
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Product Image</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                  style={{ 
                    borderColor: '#E9C46A',
                    backgroundColor: '#FFFCF2',
                    color: '#3E3E3E'
                  }}
                  onChange={handleImageChange}
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-xs mb-1" style={{ color: '#3E3E3E' }}>Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-md border-2"
                      style={{ borderColor: '#E9C46A' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, image: null});
                        setImagePreview(null);
                      }}
                      className="ml-2 text-xs hover:underline"
                      style={{ color: '#3E3E3E' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                <p className="text-xs opacity-60" style={{ color: '#3E3E3E' }}>
                  Supported: JPG, PNG, GIF (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Price & Stock Only - HAPUS Min Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Price *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Stock</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                placeholder="0"
              />
              <p className="text-xs opacity-60 mt-1" style={{ color: '#3E3E3E' }}>
                💡 Min stock will be auto-calculated (10% of stock)
              </p>
            </div>

            {/* HAPUS Min Stock field completely */}
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Description</label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70 resize-none"
              style={{ 
                borderColor: '#E9C46A',
                backgroundColor: '#FFFCF2',
                color: '#3E3E3E'
              }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter product description (optional)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                navigate('/admin/products');
              }}
              className="px-6 py-2 rounded-md font-medium border-2 transition-all duration-200"
              style={{ 
                backgroundColor: 'transparent',
                color: '#3E3E3E',
                borderColor: '#E9C46A'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50"
              style={{ 
                backgroundColor: '#E9C46A',
                color: '#3E3E3E'
              }}
            >
              {submitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Add function to view product details
  const handleViewProduct = (product) => {
    console.log('Selected product:', product);  // Debug log
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await api.delete(`/products/${product.id}`);
        alert('Product deleted successfully!');
        fetchData(); // Refresh the product list
      } catch (error) {
        console.error('Delete product error:', error);
        alert('Failed to delete product: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Product Detail Modal Component
  const ProductDetailModal = () => {
    const [barcodeImage, setBarcodeImage] = useState(null);

    useEffect(() => {
      if (selectedProduct?.barcode) {
        generateBarcodeImage(selectedProduct.barcode);
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const generateBarcodeImage = (barcodeValue) => {
      try {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, barcodeValue, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          margin: 10,
          background: "#FFFCF2",
          lineColor: "#3E3E3E"
        });
        setBarcodeImage(canvas.toDataURL());
      } catch (error) {
        console.error('Barcode generation error:', error);
        setBarcodeImage(null);
      }
    };

    if (!selectedProduct) return null;

    const profit = selectedProduct.price - (selectedProduct.cost || 0);
    const profitPercentage = selectedProduct.cost ? ((profit / selectedProduct.cost) * 100).toFixed(1) : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F7E9A0' }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center" style={{ color: '#3E3E3E' }}>
              📦 Product Details
            </h2>
            <button 
              onClick={() => setShowDetailModal(false)}
              className="text-3xl font-bold hover:opacity-70 transition-opacity"
              style={{ color: '#3E3E3E' }}
            >
              ×
            </button>
          </div>

          {/* Product Image */}
          {selectedProduct.image_url && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 rounded-lg border-2" style={{ backgroundColor: '#FFFCF2', borderColor: '#E9C46A' }}>
                <img 
                  src={`http://localhost:5000${selectedProduct.image_url}`} 
                  alt={selectedProduct.name}
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            </div>
          )}

          {/* Product Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Product Name</h3>
                <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>{selectedProduct.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Selling Price</h3>
                <p className="text-xl font-bold" style={{ color: '#3E3E3E' }}>Rp {selectedProduct.price?.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Profit</h3>
                <p className="text-lg font-bold" style={{ color: profit >= 0 ? '#4CAF50' : '#FF5722' }}>
                  Rp {profit.toLocaleString()} ({profitPercentage}%)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Current Stock</h3>
                <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>{selectedProduct.stock} units</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Category</h3>
                <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>{selectedProduct.category_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Cost Price</h3>
                <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>Rp {(selectedProduct.cost || 0).toLocaleString()}</p>
              </div>

              {/* Barcode Section */}
              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Barcode</h3>
                {selectedProduct.barcode ? (
                  <div className="mt-2">
                    <div className="p-3 rounded-md border-2 bg-white text-center" style={{ borderColor: '#E9C46A' }}>
                      {barcodeImage ? (
                        <div>
                          <img 
                            src={barcodeImage} 
                            alt="Product Barcode" 
                            className="mx-auto block"
                            style={{ maxWidth: '100%' }}
                          />
                        </div>
                      ) : (
                        <p className="text-lg font-mono font-bold" style={{ color: '#3E3E3E' }}>
                          {selectedProduct.barcode}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm opacity-60" style={{ color: '#3E3E3E' }}>No barcode</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>Min Stock Alert</h3>
                <p className="text-lg font-bold" style={{ color: '#3E3E3E' }}>{selectedProduct.min_stock} units</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedProduct.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>Description</h3>
              <div className="p-4 rounded-md border-2" style={{ backgroundColor: '#FFFCF2', borderColor: '#E9C46A' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#3E3E3E' }}>
                  {selectedProduct.description}
                </p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mt-6 text-center">
            <span 
              className="px-6 py-2 rounded-full text-sm font-bold"
              style={{
                backgroundColor: selectedProduct.stock_status === 'normal' ? '#4CAF50' : 
                                selectedProduct.stock_status === 'low' ? '#FF9800' : '#FF5722',
                color: '#FFFFFF'
              }}
            >
              Status: {selectedProduct.stock_status === 'normal' ? 'Normal Stock' :
                       selectedProduct.stock_status === 'low' ? 'Low Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Close Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-8 py-3 rounded-md font-medium transition-all duration-200"
              style={{ 
                backgroundColor: '#E9C46A',
                color: '#3E3E3E'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

  };

  // Edit Product Form Component
  const EditProductForm = () => {
    const [formData, setFormData] = useState({
      name: editingProduct?.name || '',
      category_id: editingProduct?.category_id || '',
      price: editingProduct?.price || '',
      stock: editingProduct?.stock || '',
      description: editingProduct?.description || '',
      image: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(
      editingProduct?.image_url ? `http://localhost:5000${editingProduct.image_url}` : null
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('category_id', parseInt(formData.category_id));
        submitData.append('price', parseFloat(formData.price));
        submitData.append('stock', parseInt(formData.stock) || 0);
        
        const stock = parseInt(formData.stock) || 0;
        const autoMinStock = Math.max(1, Math.floor(stock * 0.1));
        submitData.append('min_stock', autoMinStock);
        
        submitData.append('description', formData.description);
        
        if (formData.image) {
          submitData.append('image', formData.image);
        }
        
        await api.put(`/products/${editingProduct.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        alert('Product updated successfully!');
        setShowEditForm(false);
        setEditingProduct(null);
        fetchData();
        
      } catch (error) {
        alert('Failed to update product: ' + (error.response?.data?.error || error.message));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#3E3E3E' }}>✏️ Edit Product</h2>
            <button 
              onClick={() => {
                setShowEditForm(false);
                setEditingProduct(null);
              }}
              className="text-2xl font-bold hover:opacity-70"
              style={{ color: '#3E3E3E' }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Product Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Category *</label>
                <select
                  required
                  className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                  style={{ 
                    borderColor: '#E9C46A',
                    backgroundColor: '#FFFCF2',
                    color: '#3E3E3E'
                  }}
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                  style={{ 
                    borderColor: '#E9C46A',
                    backgroundColor: '#FFFCF2',
                    color: '#3E3E3E'
                  }}
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Stock</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Description</label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70 resize-none"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Current Image Preview */}
            {imagePreview && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>Current Image</label>
                <img 
                  src={imagePreview} 
                  alt="Current product" 
                  className="w-20 h-20 object-cover rounded-md border-2"
                  style={{ borderColor: '#E9C46A' }}
                />
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3E3E3E' }}>
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-opacity-70"
                style={{ 
                  borderColor: '#E9C46A',
                  backgroundColor: '#FFFCF2',
                  color: '#3E3E3E'
                }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({...formData, image: file});
                    
                    // Show preview of new image
                    const reader = new FileReader();
                    reader.onload = (e) => setImagePreview(e.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-xs mt-1 opacity-70" style={{ color: '#3E3E3E' }}>
                Max file size: 5MB. Formats: JPG, PNG, GIF
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2 rounded-md font-medium border-2 transition-all duration-200"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#3E3E3E',
                  borderColor: '#E9C46A'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50"
                style={{ 
                  backgroundColor: '#E9C46A',
                  color: '#3E3E3E'
                }}
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFCF2' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#E9C46A' }}></div>
          <p className="mt-4" style={{ color: '#3E3E3E' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Page Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
            Product Management
          </h1>
          <p className="text-sm opacity-70" style={{ color: '#3E3E3E' }}>
            Manage your store products and inventory
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-md font-medium transition-all duration-200"
            style={{ 
              backgroundColor: '#E9C46A',
              color: '#3E3E3E'
            }}
          >
            + Add Product
          </button>
          <button
            onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-md font-medium transition-all duration-200 border-2"
              style={{ 
                backgroundColor: 'transparent',
                color: '#3E3E3E',
                borderColor: '#E9C46A'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && <AddProductForm />}

        {/* Products List */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
            All Products ({products.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: '#E9C46A' }}>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Image</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Product</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Category</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Price</th>
                  {/* HAPUS Cost column */}
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Stock</th>
                  <th className="text-left py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Status</th>
                  <th className="text-center py-2 px-4 font-medium" style={{ color: '#3E3E3E' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:opacity-75 transition-opacity" style={{ borderColor: '#E9C46A' }}>
                    {/* Image */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-md border-2 flex items-center justify-center" style={{ borderColor: '#E9C46A', backgroundColor: '#FFFCF2' }}>
                        {product.image_url ? (
                          <img 
                            src={`http://localhost:5000${product.image_url}`} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                    </td>

                    {/* Product Info */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium" style={{ color: '#3E3E3E' }}>{product.name}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4" style={{ color: '#3E3E3E' }}>
                      {product.category_name}
                    </td>

                    {/* Price (Selling Price Only) */}
                    <td className="py-3 px-4 font-medium" style={{ color: '#3E3E3E' }}>
                      Rp {product.price?.toLocaleString() || '0'}
                    </td>

                    {/* HAPUS Cost column - jangan tampilkan di sini */}

                    {/* Stock */}
                    <td className="py-3 px-4" style={{ color: '#3E3E3E' }}>
                      {product.stock}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: product.stock_status === 'normal' ? '#E9C46A' : 
                                          product.stock_status === 'low' ? '#FFD56B' : '#FF6B6B',
                          color: '#3E3E3E'
                        }}
                      >
                        {product.stock_status === 'normal' ? 'Normal' :
                         product.stock_status === 'low' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-2 rounded-md transition-all duration-200 hover:scale-110"
                          style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 rounded-md transition-all duration-200 hover:scale-110"
                          style={{ backgroundColor: '#FFD56B', color: '#3E3E3E' }}
                          title="Edit Product"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 rounded-md transition-all duration-200 hover:scale-110"
                          style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Edit Product Form Modal */}
      {showEditForm && <EditProductForm />}
    </AdminLayout>
  );
};

export default ProductManagement;