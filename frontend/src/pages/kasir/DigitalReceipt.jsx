import React from 'react';

const DigitalReceipt = ({ transaction, onClose, onDownload, onShare }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold" style={{ color: '#3E3E3E' }}>📄 Struk Digital</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Receipt Content */}
        <div id="digital-receipt" className="p-6 bg-white" style={{ fontFamily: 'monospace' }}>
          {/* Store Header */}
          <div className="text-center mb-4 border-b-2 border-dashed pb-4">
            <img 
                src={require('../../assets/images/logo-sellify.png')}
                alt="Sellify Logo"
                className="mx-auto mb-2 w-20 h-20"
            />
            <h3 className="font-bold text-lg">Sellify Store</h3>
            <p className="text-sm text-gray-600">GG Sensus IV RT 004 RW 014</p>
            <p className="text-sm text-gray-600">Telp: 0895339456605</p>
            <p className="text-xs text-gray-500">{transaction.id || 'TRX-' + Date.now()}</p>
          </div>

          {/* Transaction Info */}
          <div className="mb-4 text-sm">
            <div className="flex justify-between">
              <span>{formatDate(transaction.created_at || new Date())}</span>
              <span>Kasir: {transaction.cashier || 'Admin'}</span>
            </div>
            <div className="text-center mt-1">No. {transaction.transaction_number || 'TRX-001'}</div>
          </div>

          <div className="border-b border-dashed mb-4"></div>

          {/* Items */}
          <div className="mb-4">
            {transaction.items?.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="font-medium">{index + 1}. {item.name}</div>
                <div className="flex justify-between text-sm">
                  <span>{item.quantity} x {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.quantity * item.price)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed mb-4"></div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total QTY: {transaction.items?.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>{formatCurrency(transaction.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (10%)</span>
              <span>{formatCurrency(transaction.tax || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(transaction.total || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar ({transaction.payment_method || 'Cash'})</span>
              <span>{formatCurrency(transaction.amount_paid || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembalian</span>
              <span>{formatCurrency(transaction.change || 0)}</span>
            </div>
          </div>

          <div className="border-b border-dashed my-4"></div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Terimakasih Telah Berbelanja</p>
            <p className="mt-2">💳 Struk Digital</p>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p>Link Struk: sellify.com/receipt/{transaction.id || 'digital'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-gray-50 flex gap-2">
          <button
            onClick={onDownload}
            className="flex-1 py-2 px-4 rounded-lg font-medium"
            style={{ backgroundColor: '#E9C46A', color: '#3E3E3E' }}
          >
            💾 Download
          </button>
          <button
            onClick={onShare}
            className="flex-1 py-2 px-4 rounded-lg font-medium"
            style={{ backgroundColor: '#2A9D8F', color: 'white' }}
          >
            📤 Share
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalReceipt;