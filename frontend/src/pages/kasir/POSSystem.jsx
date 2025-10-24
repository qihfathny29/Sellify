import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KasirLayout from '../../components/kasir/KasirLayout';
import api from '../../api/axios';
import DigitalReceipt from './DigitalReceipt';

const POSSystem = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [customerChange, setCustomerChange] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDigitalReceipt, setShowDigitalReceipt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const navigate = useNavigate();

  // Mock products data
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
    },
    {
      id: 7,
      name: 'Beng-beng',
      category: 'Makanan Ringan',
      price: 2500,
      stock: 80,
      barcode: '8992753789012',
      image: '🍫'
    },
    {
      id: 8,
      name: 'Mie Sedaap',
      category: 'Makanan Ringan',
      price: 3000,
      stock: 90,
      barcode: '8992753890123',
      image: '🍝'
    }
  ];

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch from real API instead of mock data
      const response = await api.get('/products');
      
      console.log('🔥 POS - API Response:', response.data); // DEBUG
      
      if (response.data.success) {
        const productsData = response.data.data || [];
        
        console.log('🔥 POS - Products Data:', productsData); // DEBUG
        console.log('🔥 POS - First Product:', productsData[0]); // DEBUG - lihat struktur produk pertama
        
        // Debug: Cek field status dan stock dari setiap produk
        productsData.forEach((product, index) => {
          console.log(`🔥 Product ${index + 1}:`, {
            name: product.name,
            status: product.status,
            statusType: typeof product.status,
            stock: product.stock,
            stockType: typeof product.stock,
            category_name: product.category_name
          });
        });
        
        // Filter only active products - PERBAIKAN FILTER untuk boolean
        const activeProducts = productsData.filter(product => {
          // Handle boolean status (true/false) instead of 1/0
          const isActive = product.status === true || product.status === 1 || product.status === '1';
          // Stock sudah number, tidak perlu konversi
          const hasStock = product.stock > 0;
          
          console.log(`🔥 Filtering ${product.name}:`, {
            originalStatus: product.status,
            isActive: isActive,
            stock: product.stock,
            hasStock: hasStock,
            passFilter: isActive && hasStock
          });
          
          return isActive && hasStock;
        });
        
        console.log('🔥 POS - Active Products:', activeProducts); // DEBUG
        
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      } else {
        console.error('Failed to fetch products');
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm))
      );
    }

    // Category filter - PERBAIKAN DI SINI
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category_name === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert(`Stok ${product.name} tidak cukup! Tersisa: ${product.stock}`);
      }
    } else {
      // Add new item - adapt to real product structure
      setCart([...cart, { 
        ...product, 
        quantity: 1,
        price: parseFloat(product.price) // Ensure price is number
      }]);
    }
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    
    if (newQuantity > product.stock) {
      alert(`Stok ${product.name} hanya ${product.stock}!`);
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // HAPUS deklarasi duplikat ini jika ada:
  // const customerChange = amountPaid ? parseFloat(amountPaid) - total : 0;

  // Gunakan useEffect untuk update customerChange state secara reaktif
  useEffect(() => {
    const paid = parseFloat(amountPaid || 0);
    const change = Number.isFinite(paid) ? Math.max(0, paid - total) : 0;
    setCustomerChange(change);
  }, [amountPaid, total]);

  // Process payment - UPDATE untuk menghitung kembalian & kirim ke backend
  const handleProcessPayment = async () => {
    if (paymentMethod === 'cash' && parseFloat(amountPaid || 0) < total) {
      alert('Jumlah bayar tidak mencukupi!');
      return;
    }

    setProcessingPayment(true);

    try {
      const paidValue = parseFloat(amountPaid || 0);
      const changeAmount = Math.max(0, paidValue - total);

      const transactionData = {
        items: cart,
        subtotal: subtotal,
        tax: tax,
        total: total,
        payment_method: paymentMethod,
        amount_paid: paidValue,
        change_amount: changeAmount
      };

      // Save to database
      const response = await api.post('/transactions', transactionData);

      if (response.data.success) {
        // update local stock, etc...
        // ...existing code...

        // Prepare transaction data for receipt — pastikan change ikut
        const receiptData = {
          ...transactionData,
          id: response.data.data.id,
          transaction_number: response.data.data.transaction_code,
          cashier: 'Kasir',
          created_at: new Date().toISOString(),
          change: changeAmount, // legacy fallback
          change_amount: changeAmount
        };

        setLastTransaction(receiptData);
        setShowDigitalReceipt(true);

        // Reset form
        setCart([]);
        setAmountPaid('');
        setShowPaymentModal(false);
      } else {
        throw new Error('Failed to save transaction');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Gagal memproses pembayaran!');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Download receipt as image
  const handleDownloadReceipt = () => {
    // Using html2canvas library (install: npm install html2canvas)
    import('html2canvas').then(html2canvas => {
      const receiptElement = document.getElementById('digital-receipt');
      html2canvas.default(receiptElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `struk-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  };

  // Share receipt
  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Struk Pembelian - Sellify',
        text: `Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(lastTransaction.total)}`,
        url: `${window.location.origin}/receipt/${lastTransaction.id || 'digital'}`
      });
    } else {
      // Fallback: copy to clipboard
      const receiptText = `
Sellify Store
${new Date().toLocaleString('id-ID')}
Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(lastTransaction.total)}
Terimakasih telah berbelanja!
      `;
      navigator.clipboard.writeText(receiptText);
      alert('Link struk disalin ke clipboard!');
    }
  };

  // PERBAIKAN CATEGORIES - Gunakan category_name seperti di Products.jsx
  const categories = ['all', ...new Set(products.map(p => p.category_name || 'Uncategorized').filter(Boolean))];

  // Handler saat tutup struk digital
  const handleCloseReceipt = () => {
    setShowDigitalReceipt(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/kasir/transactions'); // redirect ke Transaksi Saya
    }, 1500); // animasi selesai 1.5 detik
  };

  if (loading) {
    return (
      <KasirLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2C3E50' }}></div>
            <p style={{ color: '#2C3E50' }}>Loading POS...</p>
          </div>
        </div>
      </KasirLayout>
    );
  }

  return (
    <KasirLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>💰 POS System</h1>
            <p className="opacity-70 mt-1" style={{ color: '#2C3E50' }}>
              Pilih produk untuk memulai transaksi
            </p>
          </div>

          {/* Search & Filter */}
          <div className="rounded-lg shadow-lg p-4" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="🔍 Cari produk atau scan barcode..."
                className="w-full px-4 py-2 border-2 rounded-md focus:outline-none"
                style={{ 
                  borderColor: '#2C3E50',
                  backgroundColor: '#F5F5F5',
                  color: '#2C3E50'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              {/* Category Filter */}
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
                    {cat === 'all' ? '📦 Semua Kategori' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0 || product.status !== true} // PERBAIKAN: status !== true
                className="rounded-lg shadow-lg p-4 text-left transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                {/* Product Image */}
                <div className="mb-2">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={product.name}
                      className="w-16 h-16 mx-auto object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className="text-4xl text-center"
                    style={{ display: product.image ? 'none' : 'block' }}
                  >
                    📦
                  </div>
                </div>
                
                <h3 className="font-bold text-sm mb-1" style={{ color: '#2C3E50' }}>
                  {product.name}
                </h3>
                <p className="text-xs opacity-70 mb-2" style={{ color: '#2C3E50' }}>
                  {product.category_name || 'Uncategorized'}
                </p>
                <p className="font-bold text-lg" style={{ color: '#2C3E50' }}>
                  Rp {parseFloat(product.price || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs mt-1" style={{ color: product.stock < 10 ? '#FF5722' : '#4CAF50' }}>
                  Stok: {product.stock}
                </p>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
              <p className="text-xl" style={{ color: '#2C3E50' }}>📭</p>
              <p style={{ color: '#2C3E50' }}>Produk tidak ditemukan</p>
            </div>
          )}
        </div>

        {/* Right Side - Shopping Cart */}
        <div className="lg:col-span-1">
          <div className="rounded-lg shadow-lg p-6 sticky top-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
              🛒 Keranjang
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🛒</p>
                  <p className="text-sm opacity-70" style={{ color: '#2C3E50' }}>
                    Keranjang masih kosong
                  </p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="p-3 rounded-md" style={{ backgroundColor: '#F5F5F5' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: '#2C3E50' }}>
                          {item.name}
                        </p>
                        <p className="text-xs opacity-70" style={{ color: '#2C3E50' }}>
                          Rp {item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-md font-bold transition-colors duration-200"
                          style={{ 
                            backgroundColor: '#2C3E50',
                            color: '#FFFFFF'
                          }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border-2 rounded-md py-1"
                          style={{ 
                            borderColor: '#2C3E50',
                            color: '#2C3E50'
                          }}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-md font-bold transition-colors duration-200"
                          style={{ 
                            backgroundColor: '#2C3E50',
                            color: '#FFFFFF'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold" style={{ color: '#2C3E50' }}>
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <>
                <div className="border-t pt-4 space-y-2" style={{ borderColor: '#2C3E50' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2C3E50' }}>Subtotal:</span>
                    <span style={{ color: '#2C3E50' }}>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#2C3E50' }}>Pajak (10%):</span>
                    <span style={{ color: '#2C3E50' }}>Rp {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2" style={{ borderColor: '#2C3E50', color: '#2C3E50' }}>
                    <span>TOTAL:</span>
                    <span>Rp {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-3 rounded-md font-bold text-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: '#2C3E50',
                      color: '#FFFFFF'
                    }}
                  >
                    💳 Bayar Sekarang
                  </button>
                  <button
                    onClick={() => setCart([])}
                    className="w-full py-2 rounded-md font-medium border-2 transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#FF5722',
                      borderColor: '#FF5722'
                    }}
                  >
                    🗑️ Kosongkan Keranjang
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-lg w-full rounded-lg shadow-xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
                💳 Pembayaran
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-2xl hover:opacity-75"
                style={{ color: '#2C3E50' }}
              >
                ✕
              </button>
            </div>

            {/* Total */}
            <div className="mb-6 p-4 rounded-md text-center" style={{ backgroundColor: '#F5F5F5' }}>
              <p className="text-sm opacity-70 mb-1" style={{ color: '#2C3E50' }}>Total Bayar</p>
              <p className="text-3xl font-bold" style={{ color: '#2C3E50' }}>
                Rp {total.toLocaleString()}
              </p>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-3 rounded-md font-medium transition-colors duration-200 ${
                    paymentMethod === 'cash' ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: paymentMethod === 'cash' ? '#2C3E50' : '#F5F5F5',
                    color: '#FFFFFF',
                    ringColor: '#2C3E50'
                  }}
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`py-3 rounded-md font-medium transition-colors duration-200 ${
                    paymentMethod === 'qris' ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: paymentMethod === 'qris' ? '#2C3E50' : '#F5F5F5',
                    color: '#FFFFFF',
                    ringColor: '#2C3E50'
                  }}
                >
                  📱 QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`py-3 rounded-md font-medium transition-colors duration-200 ${
                    paymentMethod === 'transfer' ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: paymentMethod === 'transfer' ? '#2C3E50' : '#F5F5F5',
                    color: '#FFFFFF',
                    ringColor: '#2C3E50'
                  }}
                >
                  🏦 Transfer
                </button>
              </div>
            </div>

            {/* Cash Payment Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#2C3E50' }}>
                  Jumlah Uang Diterima
                </label>
                <input
                  type="number"
                  placeholder="Masukkan jumlah uang..."
                  className="w-full px-4 py-3 text-lg border-2 rounded-md focus:outline-none"
                  style={{ 
                    borderColor: '#2C3E50',
                    backgroundColor: '#F5F5F5',
                    color: '#2C3E50'
                  }}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  autoFocus
                />
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[50000, 100000, 150000, 200000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setAmountPaid(amount.toString())}
                      className="py-2 text-sm rounded-md transition-colors duration-200"
                      style={{ 
                        backgroundColor: '#F5F5F5',
                        color: '#2C3E50',
                        border: '1px solid #2C3E50'
                      }}
                    >
                      {amount / 1000}k
                    </button>
                  ))}
                </div>

                {/* Change Display */}
                {amountPaid && parseFloat(amountPaid) >= total && (
                  <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Kembalian:</span>
                      <span className="text-xl font-bold">
                        Rp {customerChange.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
                className="flex-1 py-3 rounded-md font-medium border-2 transition-colors duration-200"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#2C3E50',
                  borderColor: '#2C3E50'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={processingPayment}
                className="flex-1 py-3 rounded-md font-bold transition-colors duration-200 disabled:opacity-50"
                style={{ 
                  backgroundColor: '#4CAF50',
                  color: 'white'
                }}
              >
                {processingPayment ? '⏳ Memproses...' : '✅ Konfirmasi Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {showDigitalReceipt && lastTransaction && (
        <DigitalReceipt
          transaction={lastTransaction}
          onClose={handleCloseReceipt}
          onDownload={handleDownloadReceipt}
          onShare={handleShareReceipt}
        />
      )}

      {/* Animasi selesai */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center animate-bounce">
            <div className="text-4xl mb-2 text-green-500">✅</div>
            <div className="font-bold text-lg mb-1">Transaksi Selesai!</div>
            <div className="text-gray-600">Anda akan diarahkan ke halaman Transaksi Saya...</div>
          </div>
        </div>
      )}
    </KasirLayout>
  );
};

export default POSSystem;
