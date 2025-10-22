import React, { useState, useEffect } from 'react';
import KasirLayout from '../../components/kasir/KasirLayout';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

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
      const response = await api.get('/products');
      
      if (response.data.success) {
        const productsData = response.data.data || [];
        
        // DEBUG: Log product data
        console.log('🔥 Products data:', productsData);
        productsData.forEach(product => {
          console.log(`Product: ${product.name}`);
          console.log(`Image path: ${product.image}`);
          console.log(`Full URL: http://localhost:5000${product.image}`);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E9C46A' }}></div>
            <p style={{ color: '#3E3E3E' }}>Loading products...</p>
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
            <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>📦 Product Catalog</h1>
            <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
              Browse available products and check details
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 rounded-md font-medium transition-colors duration-200"
            style={{ 
              backgroundColor: '#E9C46A',
              color: '#3E3E3E'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg p-4" style={{ backgroundColor: '#FFE5E5' }}>
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#F7E9A0' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 Search products..."
              className="w-full px-4 py-2 border-2 rounded-md focus:outline-none"
              style={{ 
                borderColor: '#E9C46A',
                backgroundColor: '#FFFCF2',
                color: '#3E3E3E'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="w-full px-4 py-2 border-2 rounded-md focus:outline-none"
              style={{ 
                borderColor: '#E9C46A',
                backgroundColor: '#FFFCF2',
                color: '#3E3E3E'
              }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? '📦 All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simple Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="rounded-lg shadow-lg p-6 transition-transform duration-200 hover:scale-105 cursor-pointer"
              style={{ backgroundColor: '#F7E9A0' }}
              onClick={() => navigate(`/kasir/products/${product.id}`)}
            >
              {/* SIMPLIFIED IMAGE - NO CONDITIONS */}
              <div className="mb-4 text-center">
                {product.image ? (
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    className="w-24 h-24 mx-auto object-cover rounded-lg shadow-md block"
                  />
                ) : (
                  <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
              </div>

              {/* Product Name */}
              <h3 className="font-bold text-lg mb-3 text-center" style={{ color: '#3E3E3E' }}>
                {product.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm opacity-70 mb-4 text-center" style={{ color: '#3E3E3E' }}>
                {product.description || 'No description available'}
              </p>

              {/* View Details Button */}
              <button
                className="w-full py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
                style={{ 
                  backgroundColor: '#E9C46A',
                  color: '#3E3E3E'
                }}
              >
                👁️ Lihat Detail
              </button>
            </div>
          ))}
        </div>

        {/* No Products Found */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#F7E9A0' }}>
            <p className="text-6xl mb-4">📭</p>
            <p className="text-xl font-medium mb-2" style={{ color: '#3E3E3E' }}>
              {products.length === 0 ? 'No products available' : 'No products found'}
            </p>
            <p className="opacity-70" style={{ color: '#3E3E3E' }}>
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
            <div className="max-w-2xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#F7E9A0' }}>
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