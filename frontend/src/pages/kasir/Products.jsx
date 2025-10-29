import React, { useState, useEffect } from 'react';
import KasirLayout from '../../components/kasir/KasirLayout';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaSyncAlt, FaExclamationTriangle, FaSearch, FaInbox, FaEye } from 'react-icons/fa';

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch products from backend API
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products', {
        params: {
          limit: 100 // Get more products for kasir
        }
      });
      
      if (response.data.success) {
        const productsData = response.data.data || [];
        
        // DEBUG: Log product data
        console.log('🔥 Products data:', productsData);
        productsData.forEach(product => {
          console.log(`Product: ${product.name}`);
          console.log(`Image path: ${product.image_url}`);
          console.log(`Full URL: http://localhost:5000${product.image_url}`);
        });
        
        setProducts(productsData);
        
        const uniqueCategories = [...new Set(productsData.map(p => p.category_name || 'Uncategorized'))];
        setCategories(['all', ...uniqueCategories]);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to connect to server');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    const matchesCategory = categoryFilter === 'all' || product.category_name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('id-ID');
  };

  // Generate Barcode SVG
  const generateBarcode = (text) => {
    const barcodeText = text || '12345654';
    const bars = barcodeText.split('').map((digit, index) => {
      const width = (parseInt(digit) % 3) + 1; // Variable width based on digit
      return (
        <rect
          key={index}
          x={index * 8}
          y="0"
          width={width}
          height="40"
          fill="#000"
        />
      );
    });

    return (
      <div className="bg-white p-4 rounded-md border-2 border-gray-300">
        <svg width="200" height="60" className="mx-auto">
          <g>{bars}</g>
          <text x="100" y="55" textAnchor="middle" fontSize="10" fill="#000">
            {barcodeText}
          </text>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <KasirLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2C3E50' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading products...</p>
          </div>
        </div>
      </KasirLayout>
    );
  }

  return (
    <KasirLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: '#2C3E50' }}><FaBox /> Product Catalog</h1>
            <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
              Browse available products and check details
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
            style={{ 
              backgroundColor: '#2C3E50',
              color: '#FFFFFF'
            }}
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg p-4 flex items-center gap-2" style={{ backgroundColor: '#FFE5E5' }}>
            <FaExclamationTriangle className="text-red-600 text-xl" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border-2 rounded-md focus:outline-none pl-10"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F5F5F5',
                  color: '#2C3E50'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            <select
              className="w-full px-4 py-2 border-2 rounded-md focus:outline-none"
              style={{ 
                borderColor: '#2C3E50',
                backgroundColor: '#F5F5F5',
                color: '#2C3E50'
              }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Enhanced Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden border border-gray-100"
              onClick={() => navigate(`/kasir/products/${product.id}`)}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                {product.image_url ? (
                  <img
                    src={`http://localhost:5000${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center" style={{ display: product.image_url ? 'none' : 'flex' }}>
                  <FaBox className="text-4xl text-gray-400" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {product.status === 1 ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Inactive
                    </span>
                  )}
                </div>

                {/* Stock Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 10 ? 'bg-blue-100 text-blue-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Stock: {product.stock || 0}
                  </span>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-4">
                {/* Category */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {product.category_name || 'Uncategorized'}
                  </span>
                  <span className="text-xs text-gray-400">
                    ID: {product.id}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">
                  {product.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {product.description || 'No description available'}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      Rp {(product.price || 0).toLocaleString('id-ID')}
                    </p>
                    {product.cost_price && (
                      <p className="text-xs text-gray-500">
                        Cost: Rp {product.cost_price.toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {product.cost_price && (
                      <p className="text-xs text-green-600 font-medium">
                        Profit: Rp {(product.price - product.cost_price).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                 <button
                  className="w-full py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90"
                  style={{
                    backgroundColor: '#2C3E50'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/kasir/products/${product.id}`);
                  }}
                >
                  <FaEye /> Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Found */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-6xl mb-4 flex items-center justify-center"><FaInbox /></p>
            <p className="text-xl font-medium mb-2" style={{ color: '#2C3E50' }}>
              {products.length === 0 ? 'No products available' : 'No products found'}
            </p>
            <p className="opacity-70" style={{ color: '#2C3E50' }}>
              {products.length === 0 
                ? 'Ask admin to add products first' 
                : 'Try adjusting your search or filter'
              }
            </p>
          </div>
        )}

        {/* Barcode Section (for reference, not used in modal anymore) */}
        {/* {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="p-6">
                {generateBarcode(selectedProduct.barcode)}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </KasirLayout>
  );
};

export default Products;
