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

  // Generate Barcode SVG
  const generateBarcode = (text) => {
    const barcodeText = text || '12345654';
    const bars = barcodeText.split('').map((digit, index) => {
      const width = (parseInt(digit) % 3) + 1;
      return (
        <rect
          key={index}
          x={index * 12}
          y="0"
          width={width}
          height="60"
          fill="#000"
        />
      );
    });

    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-300 text-center">
        <svg width="300" height="80" className="mx-auto">
          <g>{bars}</g>
          <text x="150" y="75" textAnchor="middle" fontSize="14" fill="#000">
            {barcodeText}
          </text>
        </svg>
      </div>
    );
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <KasirLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E9C46A' }}></div>
            <p style={{ color: '#3E3E3E' }}>Loading product details...</p>
          </div>
        </div>
      </KasirLayout>
    );
  }

  if (error || !product) {
    return (
      <KasirLayout>
        <div className="text-center py-12">
          <div className="rounded-lg p-8" style={{ backgroundColor: '#F7E9A0' }}>
            <p className="text-6xl mb-4">❌</p>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
              Product Not Found
            </h2>
            <p className="mb-6 opacity-70" style={{ color: '#3E3E3E' }}>
              {error || 'The product you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate('/kasir/products')}
              className="px-6 py-3 rounded-md font-medium transition-colors duration-200"
              style={{ 
                backgroundColor: '#E9C46A',
                color: '#3E3E3E'
              }}
            >
              ← Back to Products
            </button>
          </div>
        </div>
      </KasirLayout>
    );
  }

  return (
    <KasirLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/kasir/products')}
                className="px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2 hover:opacity-80"
                style={{ 
                  backgroundColor: '#E9C46A',
                  color: '#3E3E3E'
                }}
              >
                <span>←</span>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-2" style={{ color: '#3E3E3E' }}>
                  <span>📦</span>
                  <span>Product Details</span>
                </h1>
                <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
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
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
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
                        backgroundColor: '#FFFCF2',
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
                      backgroundColor: '#FFFCF2',
                      minHeight: '250px'
                    }}
                  >
                    <span className="text-8xl">📦</span>
                  </div>
                )}
              </div>
            </div>

            {/* Barcode Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-lg font-semibold" style={{ color: '#3E3E3E' }}>Barcode</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                {/* Barcode Visual */}
                <div className="flex justify-center items-center mb-4">
                  <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
                    <div className="flex justify-center items-center gap-1 mb-2">
                      {/* Barcode lines */}
                      {[...Array(15)].map((_, i) => (
                        <div 
                          key={i}
                          className="bg-black"
                          style={{ 
                            width: Math.random() > 0.5 ? '2px' : '4px',
                            height: '40px'
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Barcode number - PERBAIKAN DI SINI */}
                    <div className="text-center text-sm font-mono mt-2" style={{ color: '#3E3E3E' }}>
                      {product.barcode || 'No barcode'}
                    </div>
                  </div>
                </div>
                
                {/* Copy barcode button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(product.barcode || '');
                    alert('Barcode copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: '#E9C46A',
                    color: '#3E3E3E'
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
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium opacity-70 mb-1" style={{ color: '#3E3E3E' }}>
                    Product Name
                  </label>
                  <h2 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>
                    {product.name}
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium opacity-70 mb-1" style={{ color: '#3E3E3E' }}>
                    Category
                  </label>
                  <p className="text-xl font-medium" style={{ color: '#3E3E3E' }}>
                    {product.category_name || 'Kebutuhan Harian'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
                💰 Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                    Selling Price
                  </label>
                  <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    Rp {formatPrice(product.price)}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                    Cost Price
                  </label>
                  <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    Rp {formatPrice(product.cost)}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
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
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
                📦 Stock Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                    Current Stock
                  </label>
                  <p className={`text-3xl font-bold ${product.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock} units
                  </p>
                  {product.stock <= 10 && (
                    <p className="text-sm text-red-600 mt-1 font-medium">⚠️ Low Stock Alert!</p>
                  )}
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                    Min Stock Alert
                  </label>
                  <p className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>
                    {product.min_stock || 1} units
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#3E3E3E' }}>
                📝 Description
              </h3>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
                <p className="text-lg leading-relaxed" style={{ color: '#3E3E3E' }}>
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