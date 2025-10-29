import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';
import api from '../../api/axios';
import { 
  FaBox, 
  FaSearch, 
  FaFolderOpen, 
  FaCheck, 
  FaExclamationTriangle, 
  FaTimes, 
  FaSyncAlt, 
  FaTrash, 
  FaEye, 
  FaEdit, 
  FaBarcode 
} from 'react-icons/fa';

const ProductManagement = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: {
          search: searchTerm,
          category_id: categoryFilter,
          stock_status: stockFilter,
          sort_by: sortBy,
          sort_order: sortOrder,
          page: page,
          limit: 10
        }
      });

      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, stockFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Load JsBarcode library once on component mount
  useEffect(() => {
    // Check if JsBarcode already loaded
    if (!window.JsBarcode && !document.getElementById('jsbarcode-script')) {
      const script = document.createElement('script');
      script.id = 'jsbarcode-script';
      script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
      script.onload = () => {
        console.log('✅ JsBarcode loaded successfully!');
      };
      script.onerror = () => {
        console.error('❌ Failed to load JsBarcode');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Generate barcode when detail modal opens
  useEffect(() => {
    if (showDetailModal && selectedProduct && selectedProduct.barcode) {
      let retryCount = 0;
      const maxRetries = 20; // Max 2 seconds (20 x 100ms)
      
      const generateBarcode = () => {
        if (window.JsBarcode) {
          try {
            const barcodeElement = document.getElementById(`barcode-${selectedProduct.id}`);
            if (barcodeElement) {
              console.log('🔄 Generating barcode:', selectedProduct.barcode);
              window.JsBarcode(barcodeElement, selectedProduct.barcode, {
                format: 'CODE128',
                width: 2,
                height: 60,
                displayValue: false,
                margin: 10,
                background: '#ffffff'
              });
              console.log('✅ Barcode generated!');
            } else {
              console.warn('⚠️ Canvas element not found, retrying...');
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(generateBarcode, 100);
              }
            }
          } catch (error) {
            console.error('❌ Barcode generation error:', error);
          }
        } else {
          console.warn('⚠️ JsBarcode not loaded yet, retrying...', retryCount);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(generateBarcode, 100);
          } else {
            console.error('❌ JsBarcode failed to load after', maxRetries, 'retries');
          }
        }
      };
      
      // Start generation after small delay
      setTimeout(generateBarcode, 100);
    }
  }, [showDetailModal, selectedProduct]);

  // Handle create/edit
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('✅ Produk berhasil diupdate!');
      } else {
        await api.post('/products', productData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('✅ Produk berhasil ditambahkan!');
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Save product error:', error);
      alert('❌ Gagal menyimpan produk: ' + error.response?.data?.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      await api.delete(`/products/${id}`);
      alert('✅ Produk berhasil dihapus!');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Gagal menghapus produk');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Pilih produk yang ingin dihapus');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus ${selectedProducts.length} produk?`)) return;

    try {
      await api.post('/products/bulk-delete', { ids: selectedProducts });
      alert(`✅ ${selectedProducts.length} produk berhasil dihapus!`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('❌ Gagal menghapus produk');
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle select single
  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStockFilter('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl" style={{ color: '#2C3E50' }}>Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
              <FaBox className="inline mr-2" /> Product Management
            </h1>
            <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
              Kelola produk yang dijual di toko
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center"
            style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
          >
            ➕ Tambah Produk
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{ color: '#2C3E50' }} />
              <input
                type="text"
                placeholder="Cari nama produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#E8E8E8' }}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FaFolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{ color: '#2C3E50' }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 px-4 py-2 border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#E8E8E8', color: '#2C3E50' }}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#E8E8E8', color: '#2C3E50' }}
            >
              <option value="">Semua Stok</option>
              <option value="available">Ada Stok</option>
              <option value="low">Stok Menipis</option>
              <option value="out">Habis</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#E8E8E8', color: '#2C3E50' }}
            >
              <option value="name_ASC">Nama A-Z</option>
              <option value="name_DESC">Nama Z-A</option>
              <option value="price_ASC">Harga Termurah</option>
              <option value="price_DESC">Harga Termahal</option>
              <option value="stock_ASC">Stok Terkecil</option>
              <option value="stock_DESC">Stok Terbanyak</option>
              <option value="created_at_DESC">Terbaru</option>
              <option value="created_at_ASC">Terlama</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              style={{ borderColor: '#E8E8E8', color: '#2C3E50' }}
            >
              <FaTimes className="mr-1" /> Reset
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <span className="font-semibold" style={{ color: '#2C3E50' }}>
              {selectedProducts.length} produk dipilih
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center"
              style={{ backgroundColor: '#E74C3C', color: '#FFFFFF' }}
            >
              <FaTrash className="mr-1" /> Hapus Terpilih
            </button>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#2C3E50' }}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                    Harga
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                    Satuan
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: '#FFFFFF' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: '#FFFFFF' }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr 
                    key={product.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#E8E8E8' }}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold" style={{ color: '#2C3E50' }}>
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: '#2C3E50' }}>
                        {product.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>
                        Rp {parseInt(product.price).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span 
                        className="font-semibold"
                        style={{ 
                          color: product.stock === 0 ? '#E74C3C' : 
                                 product.stock <= product.min_stock ? '#F39C12' : '#27AE60'
                        }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm" style={{ color: '#2C3E50' }}>
                        {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {product.stock === 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: '#FADBD8', color: '#E74C3C' }}>
                          <FaTimes className="mr-1" /> Habis
                        </span>
                      ) : product.stock <= product.min_stock ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: '#FCF3CF', color: '#F39C12' }}>
                          <FaExclamationTriangle className="mr-1" /> Menipis
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: '#D5F4E6', color: '#27AE60' }}>
                          <FaCheck className="mr-1" /> Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 flex items-center"
                          style={{ backgroundColor: '#9B59B6', color: '#FFFFFF' }}
                          title="Lihat Detail & Barcode"
                        >
                          <FaEye className="mr-1" /> Detail
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 flex items-center"
                          style={{ backgroundColor: '#3498DB', color: '#FFFFFF' }}
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 flex items-center"
                          style={{ backgroundColor: '#E74C3C', color: '#FFFFFF' }}
                        >
                          <FaTrash className="mr-1" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: '#E8E8E8' }}>
              <span className="text-sm" style={{ color: '#2C3E50' }}>
                Showing {products.length} of {pagination.total} products
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 font-semibold" style={{ color: '#2C3E50' }}>
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#2C3E50', borderColor: '#E8E8E8' }}>
              <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                <FaBox className="inline mr-2" /> Detail Produk
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <img
                  src={selectedProduct.image_url ? `http://localhost:5000${selectedProduct.image_url}` : 'https://via.placeholder.com/300'}
                  alt={selectedProduct.name}
                  className="w-64 h-64 rounded-xl object-cover shadow-lg border-4"
                  style={{ borderColor: '#2C3E50' }}
                />
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Nama Produk</label>
                  <p className="text-lg font-bold mt-1" style={{ color: '#2C3E50' }}>{selectedProduct.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Kategori</label>
                  <p className="text-base font-semibold mt-1" style={{ color: '#2C3E50' }}>{selectedProduct.category_name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Harga Jual</label>
                  <p className="text-base font-bold mt-1" style={{ color: '#27AE60' }}>
                    Rp {parseInt(selectedProduct.price).toLocaleString('id-ID')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Stok</label>
                  <p className="text-base font-bold mt-1" style={{ color: selectedProduct.stock === 0 ? '#E74C3C' : '#2C3E50' }}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Satuan</label>
                  <p className="text-base font-semibold mt-1" style={{ color: '#2C3E50' }}>{selectedProduct.unit}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Min. Stok</label>
                  <p className="text-base font-semibold mt-1" style={{ color: '#2C3E50' }}>{selectedProduct.min_stock}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Status</label>
                  <div className="mt-1">
                    {selectedProduct.stock === 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: '#FADBD8', color: '#E74C3C' }}>
                        <FaTimes className="mr-1" /> Habis
                      </span>
                    ) : selectedProduct.stock <= selectedProduct.min_stock ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: '#FCF3CF', color: '#F39C12' }}>
                        <FaExclamationTriangle className="mr-1" /> Menipis
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: '#D5F4E6', color: '#27AE60' }}>
                        <FaCheck className="mr-1" /> Normal
                      </span>
                    )}
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-semibold opacity-70" style={{ color: '#2C3E50' }}>Deskripsi</label>
                    <p className="text-sm mt-1 opacity-80" style={{ color: '#2C3E50' }}>{selectedProduct.description}</p>
                  </div>
                )}

                {/* Barcode Section */}
                <div className="col-span-2 mt-4 p-4 rounded-xl border-2" style={{ borderColor: '#2C3E50', backgroundColor: '#F8F9FA' }}>
                  <label className="text-sm font-semibold opacity-70 block mb-2 flex items-center" style={{ color: '#2C3E50' }}>
                    <FaBarcode className="mr-2" /> Barcode
                  </label>
                  <div className="flex items-center justify-center">
                    {selectedProduct.barcode ? (
                      <div className="text-center">
                        <div className="bg-white p-4 rounded-lg inline-block mb-2">
                          <canvas
                            id={`barcode-${selectedProduct.id}`}
                            className="mx-auto"
                          ></canvas>
                        </div>
                        <p className="text-lg font-mono font-bold" style={{ color: '#2C3E50' }}>
                          {selectedProduct.barcode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm opacity-60" style={{ color: '#2C3E50' }}>Barcode belum tersedia</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end space-x-3" style={{ borderColor: '#E8E8E8' }}>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                className="px-6 py-2 rounded-lg font-semibold transition-colors hover:opacity-80"
                style={{ backgroundColor: '#95A5A6', color: '#FFFFFF' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductManagement;