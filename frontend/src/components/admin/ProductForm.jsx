import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    unit: 'pcs',
    description: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Unit options
  const unitOptions = [
    { value: 'pcs', label: 'Pcs (Pieces)' },
    { value: 'box', label: 'Box/Dus' },
    { value: 'pack', label: 'Pack/Bungkus' },
    { value: 'kg', label: 'Kilogram (Kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Mililiter (mL)' },
    { value: 'lusin', label: 'Lusin (12 pcs)' },
    { value: 'karung', label: 'Karung' },
    { value: 'botol', label: 'Botol' },
    { value: 'kaleng', label: 'Kaleng' },
    { value: 'roll', label: 'Roll' },
    { value: 'unit', label: 'Unit' }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id || '',
        price: product.price || '',
        stock: product.stock || '',
        unit: product.unit || 'pcs',
        description: product.description || '',
        image: null
      });
      if (product.image) {
        setImagePreview(`http://localhost:5000${product.image}`);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category_id || !formData.price || formData.stock === '') {
      alert('Nama, kategori, harga, dan stok wajib diisi!');
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E8E8E8' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
            {product ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
          </h2>
          <button
            onClick={onCancel}
            className="text-2xl hover:opacity-70 transition-opacity"
            style={{ color: '#95A5A6' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
              📸 Gambar Produk
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover border-2"
                  style={{ borderColor: '#E8E8E8' }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#E8E8E8' }}
              />
            </div>
            <p className="text-xs mt-1 opacity-70" style={{ color: '#95A5A6' }}>
              Format: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
              📦 Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Indomie Goreng"
              required
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              style={{ borderColor: '#E8E8E8' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
              📂 Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              style={{ borderColor: '#E8E8E8', color: '#2C3E50' }}
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
              💰 Harga Jual <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Contoh: 3000"
              required
              min="0"
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              style={{ borderColor: '#E8E8E8' }}
            />
          </div>

          {/* Stock & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                📊 Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Contoh: 100"
                required
                min="0"
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                style={{ borderColor: '#E8E8E8' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                📏 Satuan <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
                style={{ borderColor: '#E8E8E8', color: '#2C3E50' }}
              >
                {unitOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
              📝 Deskripsi (Opsional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi produk..."
              rows="4"
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none resize-none"
              style={{ borderColor: '#E8E8E8' }}
            />
          </div>

          {/* Profit Margin Preview */}
          {formData.price && formData.cost_price && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold mb-1" style={{ color: '#2C3E50' }}>
                💹 Profit Margin
              </p>
              <p className="text-2xl font-bold" style={{ color: '#3498DB' }}>
                Rp {(parseInt(formData.price) - parseInt(formData.cost_price)).toLocaleString('id-ID')}
                <span className="text-sm ml-2">
                  ({((parseInt(formData.price) - parseInt(formData.cost_price)) / parseInt(formData.cost_price) * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: '#E8E8E8' }}>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg font-semibold transition-colors hover:bg-gray-100"
              style={{ borderColor: '#E8E8E8', color: '#95A5A6', border: '2px solid' }}
            >
              ❌ Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
            >
              {product ? '💾 Update Produk' : '➕ Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;