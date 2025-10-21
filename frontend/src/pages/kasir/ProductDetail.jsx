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
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/kasir/products')}
              className="px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
              style={{ 
                backgroundColor: '#E9C46A',
                color: '#3E3E3E'
              }}
            >
              <span>←</span>
              <span>Back to Products</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>
                📦 Product Details
              </h1>
              <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
                Complete information about this product
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Product Image */}
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F7E9A0' }}>
            <div className="text-center">
              {product.image ? (
                <div>
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    className="w-full max-w-md mx-auto object-cover rounded-lg shadow-lg"
                    style={{ 
                      minHeight: '300px', 
                      maxHeight: '400px',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                    }}
                  />
                  <div 
                    className="fallback-icon w-full max-w-md mx-auto flex items-center justify-center rounded-lg shadow-lg"
                    style={{ 
                      backgroundColor: '#FFFCF2',
                      minHeight: '300px',
                      display: 'none'
                    }}
                  >
                    <span className="text-9xl">📦</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full max-w-md mx-auto flex items-center justify-center rounded-lg shadow-lg"
                  style={{ 
                    backgroundColor: '#FFFCF2',
                    minHeight: '300px'
                  }}
                >
                  <span className="text-9xl">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Product Information */}
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F7E9A0' }}>
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                  Product Name
                </label>
                <h2 className="text-4xl font-bold" style={{ color: '#3E3E3E' }}>
                  {product.name}
                </h2>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                  Category
                </label>
                <p className="text-xl font-medium" style={{ color: '#3E3E3E' }}>
                  {product.category_name || 'Kebutuhan Harian'}
                </p>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                    Selling Price
                  </label>
                  <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    Rp {formatPrice(product.price)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                    Cost Price
                  </label>
                  <p className="text-2xl font-bold" style={{ color: '#3E3E3E' }}>
                    Rp {formatPrice(product.cost)}
                  </p>
                </div>
              </div>

              {/* Profit */}
              <div>
                <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                  Profit
                </label>
                <p className="text-xl font-bold text-green-600">
                  Rp {formatPrice(product.price - product.cost)} 
                  ({product.cost > 0 ? Math.round(((product.price - product.cost) / product.cost) * 100) : 0}%)
                </p>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                  Current Stock
                </label>
                <p className={`text-xl font-bold ${product.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock} units
                </p>
              </div>

              {/* Min Stock Alert */}
              <div>
                <label className="block text-sm font-medium opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                  Min Stock Alert
                </label>
                <p className="text-lg font-medium" style={{ color: '#3E3E3E' }}>
                  {product.min_stock || 1} units
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Section */}
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F7E9A0' }}>
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#3E3E3E' }}>
            📊 Barcode
          </h3>
          {generateBarcode(product.barcode)}
        </div>

        {/* Description Section */}
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F7E9A0' }}>
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#3E3E3E' }}>
            📝 Description
          </h3>
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#FFFCF2' }}>
            <p className="text-lg leading-relaxed" style={{ color: '#3E3E3E' }}>
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        {/* Status Section */}
        <div className="text-center">
          <div className="inline-block rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F7E9A0' }}>
            <span 
              className={`px-8 py-4 rounded-full text-xl font-bold ${
                product.status === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {product.status === 1 ? '✅ Status: Normal Stock' : '❌ Status: Inactive'}
            </span>
          </div>
        </div>
      </div>
    </KasirLayout>
  );
};

export default ProductDetail;