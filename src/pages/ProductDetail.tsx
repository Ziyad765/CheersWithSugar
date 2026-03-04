import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState<'simple' | 'custom'>('simple');
  
  // Custom booking state
  const [customSize, setCustomSize] = useState('1 kg');
  const [customMessage, setCustomMessage] = useState('');
  const [customDetails, setCustomDetails] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-brand-500">Loading...</div>;
  if (!product) return <div className="min-h-[60vh] flex items-center justify-center text-brand-500">Product not found.</div>;

  const handleProceed = () => {
    const orderData = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      orderType: bookingType,
      ...(bookingType === 'custom' && {
        customSize,
        customMessage,
        customDetails
      })
    };
    
    // Store in session storage to pass to checkout
    sessionStorage.setItem('currentOrder', JSON.stringify(orderData));
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-600 hover:text-brand-900 transition-colors mb-8"
      >
        <ArrowLeft size={20} /> Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-brand-50"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-8 border-b border-brand-200 pb-8">
            <span className="text-brand-500 font-medium uppercase tracking-wider text-sm mb-2 block">
              {product.category}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-900 mb-4">
              {product.name}
            </h1>
            <p className="text-brand-600 text-lg leading-relaxed mb-6">
              {product.description}
            </p>
            <div className="text-3xl font-medium text-brand-900">
              ₹{product.price} <span className="text-lg text-brand-500 font-normal">base price</span>
            </div>
          </div>

          {product.isCustomizable ? (
            <div className="mb-10">
              <h3 className="font-serif text-2xl font-bold text-brand-900 mb-6">Choose Booking Type</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setBookingType('simple')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    bookingType === 'simple' 
                      ? 'border-brand-800 bg-brand-50' 
                      : 'border-brand-200 hover:border-brand-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-brand-900 text-lg">Simple Booking</h4>
                    {bookingType === 'simple' && <CheckCircle2 className="text-brand-800" size={24} />}
                  </div>
                  <p className="text-brand-600 text-sm">Standard size (0.5 kg), no custom message. Quick checkout.</p>
                </button>

                <button
                  onClick={() => setBookingType('custom')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    bookingType === 'custom' 
                      ? 'border-brand-800 bg-brand-50' 
                      : 'border-brand-200 hover:border-brand-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-brand-900 text-lg">Custom Booking</h4>
                    {bookingType === 'custom' && <CheckCircle2 className="text-brand-800" size={24} />}
                  </div>
                  <p className="text-brand-600 text-sm">Choose size, add a message, or request special details.</p>
                </button>
              </div>

              {bookingType === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 bg-brand-50 p-6 rounded-2xl border border-brand-200"
                >
                  <div>
                    <label className="block text-sm font-medium text-brand-800 mb-2">Size / Weight</label>
                    <select 
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      className="w-full p-3 rounded-xl border border-brand-300 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    >
                      <option value="0.5 kg">0.5 kg (Standard)</option>
                      <option value="1 kg">1 kg (+₹400)</option>
                      <option value="1.5 kg">1.5 kg (+₹800)</option>
                      <option value="2 kg">2 kg (+₹1200)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-800 mb-2">Message on Cake</label>
                    <input 
                      type="text" 
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="e.g., Happy Birthday Sarah!"
                      className="w-full p-3 rounded-xl border border-brand-300 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-800 mb-2">Special Instructions</label>
                    <textarea 
                      value={customDetails}
                      onChange={(e) => setCustomDetails(e.target.value)}
                      placeholder="Eggless, less sugar, specific colors..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-brand-300 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="mb-10 p-6 rounded-2xl bg-brand-50 border border-brand-200">
              <p className="text-brand-700 font-medium flex items-center gap-2">
                <CheckCircle2 size={20} className="text-brand-800" />
                Standard item. Ready for quick checkout.
              </p>
            </div>
          )}

          <button 
            onClick={handleProceed}
            className="w-full py-4 bg-brand-900 text-white rounded-full font-medium text-lg hover:bg-brand-800 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} />
            Proceed to Checkout
          </button>
        </motion.div>
      </div>
    </div>
  );
}
