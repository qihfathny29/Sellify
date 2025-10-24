import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KasirLayout from '../../components/kasir/KasirLayout';
import api from '../../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  // Generate barcode dari product data
  const generateBarcodeNumber = (product) => {
    if (product.barcode) {
      return product.barcode;
    }
    
    // Generate barcode dari ID (tambah prefix + padding)
    // Format: 8999 + ID (6 digit)
    const productId = String(product.id).padStart(6, '0');
    return `8999${productId}`;
  };

  // Fetch single product
  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/products/${id}`);
      
      if (response.data.success) {
        setProduct(response.data.data);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Format Price
  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <KasirLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2C3E50' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading product details...</p>
          </div>
        </div>
      </KasirLayout>
    );
  }

  if (error || !product) {
    return (
      <KasirLayout>
        <div className="text-center py-12">
          <div className="rounded-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-6xl mb-4">❌</p>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              Product Not Found
            </h2>
            <p className="mb-6 opacity-70" style={{ color: '#2C3E50' }}>
              {error || 'The product you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate('/kasir/products')}
              className="px-6 py-3 rounded-md font-medium transition-colors duration-200"
              style={{ 
                backgroundColor: '#2C3E50',
                color: '#2C3E50'
              }}
            >
              ← Back to Products
            </button>
          </div>
        </div>
      </KasirLayout>
    );
  }

  // Generate barcode number
  const barcodeNumber = generateBarcodeNumber(product);

  return (
    <KasirLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/kasir/products')}
                className="px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2 hover:opacity-80"
                style={{ 
                  backgroundColor: '#2C3E50',
                  color: '#FFFFFF'
                }}
              >
                <span>←</span>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-2" style={{ color: '#2C3E50' }}>
                  <span>📦</span>
                  <span>Product Details</span>
                </h1>
                <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
                  Complete information about this product
                </p>
              </div>
            </div>
            <div>
              <span 
                className={`px-6 py-3 rounded-full text-lg font-bold inline-block ${
                  product.status === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {product.status === 1 ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image & Barcode */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Image */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Product Image
              </h3>
              <div className="text-center">
                {product.image ? (
                  <div>
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-full object-cover rounded-lg shadow-lg"
                      style={{ 
                        minHeight: '250px', 
                        maxHeight: '300px',
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                      }}
                    />
                    <div 
                      className="fallback-icon w-full flex items-center justify-center rounded-lg shadow-lg"
                      style={{ 
                        backgroundColor: '#F5F5F5',
                        minHeight: '250px',
                        display: 'none'
                      }}
                    >
                      <span className="text-8xl">📦</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full flex items-center justify-center rounded-lg shadow-lg"
                    style={{ 
                      backgroundColor: '#F5F5F5',
                      minHeight: '250px'
                    }}
                  >
                    <span className="text-8xl">📦</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barcode Section - PERBAIKAN */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-lg font-semibold" style={{ color: '#2C3E50' }}>Barcode</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                {/* Barcode Visual */}
                <div className="flex justify-center items-center mb-4">
                  <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
                    <div className="flex justify-center items-center gap-1 mb-2">
                      {/* Generate barcode lines dari barcode number */}
                      {barcodeNumber.split('').map((digit, i) => (
                        <div 
                          key={i}
                          className="bg-black"
                          style={{ 
                            width: parseInt(digit) % 2 === 0 ? '3px' : '2px',
                            height: '50px'
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Barcode number */}
                    <div className="text-center text-sm font-mono font-bold mt-2" style={{ color: '#2C3E50' }}>
                      {barcodeNumber}
                    </div>
                  </div>
                </div>
                
                {/* Info jika generated */}
                {!product.barcode && (
                  <p className="text-xs text-gray-500 mb-3 italic">
                    * Auto-generated barcode
                  </p>
                )}
                
                {/* Copy barcode button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(barcodeNumber);
                    alert('✅ Barcode copied to clipboard: ' + barcodeNumber);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: '#2C3E50',
                    color: '#FFFFFF'
                  }}
                >
                  📋 Copy Barcode
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium opacity-70 mb-1" style={{ color: '#2C3E50' }}>
                    Product Name
                  </label>
                  <h2 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                    {product.name}
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium opacity-70 mb-1" style={{ color: '#2C3E50' }}>
                    Category
                  </label>
                  <p className="text-xl font-medium" style={{ color: '#2C3E50' }}>
                    {product.category_name || 'Kebutuhan Harian'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                💰 Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                    Selling Price
                  </label>
                  <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                    Rp {formatPrice(product.price)}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                    Cost Price
                  </label>
                  <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                    Rp {formatPrice(product.cost)}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                    Profit
                  </label>
                  <p className="text-xl font-bold text-green-600">
                    Rp {formatPrice(product.price - product.cost)}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    ({product.cost > 0 ? Math.round(((product.price - product.cost) / product.cost) * 100) : 0}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                📦 Stock Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                    Current Stock
                  </label>
                  <p className={`text-3xl font-bold ${product.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock} units
                  </p>
                  {product.stock <= 10 && (
                    <p className="text-sm text-red-600 mt-1 font-medium">⚠️ Low Stock Alert!</p>
                  )}
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                    Min Stock Alert
                  </label>
                  <p className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                    {product.min_stock || 1} units
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                📝 Description
              </h3>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                <p className="text-lg leading-relaxed" style={{ color: '#2C3E50' }}>
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KasirLayout>
  );
};

export default ProductDetail;
