import React, { useState, useEffect } from 'react';
import KasirLayout from '../../components/kasir/KasirLayout';

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Mock products (same as POS)
  const mockProducts = [
    {
      id: 1,
      name: 'Chitato Keju',
      category: 'Makanan Ringan',
      price: 15000,
      stock: 50,
      barcode: '8992753123456',
      image: '🍟'
    },
    {
      id: 2,
      name: 'Indomie Goreng',
      category: 'Makanan Ringan',
      price: 3500,
      stock: 100,
      barcode: '8992753234567',
      image: '🍜'
    },
    {
      id: 3,
      name: 'Aqua 600ml',
      category: 'Minuman',
      price: 5000,
      stock: 75,
      barcode: '8992753345678',
      image: '💧'
    },
    {
      id: 4,
      name: 'Teh Botol',
      category: 'Minuman',
      price: 4000,
      stock: 60,
      barcode: '8992753456789',
      image: '🍵'
    },
    {
      id: 5,
      name: 'Oreo',
      category: 'Makanan Ringan',
      price: 12000,
      stock: 40,
      barcode: '8992753567890',
      image: '🍪'
    },
    {
      id: 6,
      name: 'Coca Cola',
      category: 'Minuman',
      price: 6000,
      stock: 55,
      barcode: '8992753678901',
      image: '🥤'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(mockProducts);
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

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
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#3E3E3E' }}>📦 Product Catalog</h1>
          <p className="opacity-70 mt-1" style={{ color: '#3E3E3E' }}>
            Browse available products and check stock
          </p>
        </div>

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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="rounded-lg shadow-lg p-6"
              style={{ backgroundColor: '#F7E9A0' }}
            >
              <div className="text-6xl mb-4 text-center">{product.image}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#3E3E3E' }}>
                {product.name}
              </h3>
              <p className="text-sm opacity-70 mb-2" style={{ color: '#3E3E3E' }}>
                Category: {product.category}
              </p>
              <p className="text-sm opacity-70 mb-3" style={{ color: '#3E3E3E' }}>
                Barcode: {product.barcode}
              </p>
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-xl" style={{ color: '#3E3E3E' }}>
                  Rp {product.price.toLocaleString()}
                </p>
                <p className={`text-sm font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  Stock: {product.stock}
                </p>
              </div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#FFFCF2' }}>
                <div 
                  className={`h-2 rounded-full ${product.stock > 20 ? 'bg-green-500' : product.stock > 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(product.stock, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#F7E9A0' }}>
            <p className="text-6xl mb-4">📭</p>
            <p className="text-xl font-medium mb-2" style={{ color: '#3E3E3E' }}>No products found</p>
            <p className="opacity-70" style={{ color: '#3E3E3E' }}>Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </KasirLayout>
  );
};

export default Products;