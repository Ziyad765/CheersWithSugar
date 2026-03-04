import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerLocation: '',
    deliveryDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('currentOrder');
    if (data) {
      setOrderData(JSON.parse(data));
    } else {
      navigate('/products');
    }
  }, [navigate]);

  const calculateTotal = () => {
    if (!orderData) return 0;
    let total = orderData.price;
    if (orderData.orderType === 'custom' && orderData.customSize) {
      if (orderData.customSize === '1 kg') total += 400;
      if (orderData.customSize === '1.5 kg') total += 800;
      if (orderData.customSize === '2 kg') total += 1200;
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...orderData,
          totalPrice: calculateTotal()
        })
      });

      if (!response.ok) throw new Error('Failed to place order');
      
      setIsSuccess(true);
      sessionStorage.removeItem('currentOrder');
      toast.success('Order placed successfully!');
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) return null;

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-white p-12 rounded-3xl shadow-xl border border-brand-100"
        >
          <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-800">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="font-serif text-4xl font-bold text-brand-900 mb-4">Order Confirmed!</h2>
          <p className="text-brand-600 text-lg mb-8">
            Thank you for choosing CheersWithSugar. We'll contact you shortly to confirm delivery details.
          </p>
          <p className="text-sm text-brand-400">Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Form Section */}
        <div className="lg:col-span-7">
          <h1 className="font-serif text-4xl font-bold text-brand-900 mb-2">Checkout</h1>
          <p className="text-brand-600 mb-10">Please provide your delivery details.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-brand-900 mb-6 border-b border-brand-100 pb-4">Delivery Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-2">
                    <User size={16} /> Full Name
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full p-4 rounded-xl border border-brand-200 bg-brand-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-2">
                    <Phone size={16} /> Phone Number
                  </label>
                  <input 
                    required
                    type="tel" 
                    value={formData.customerPhone}
                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full p-4 rounded-xl border border-brand-200 bg-brand-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-2">
                    <MapPin size={16} /> Delivery Address
                  </label>
                  <textarea 
                    required
                    value={formData.customerLocation}
                    onChange={e => setFormData({...formData, customerLocation: e.target.value})}
                    placeholder="Complete address with landmark"
                    rows={3}
                    className="w-full p-4 rounded-xl border border-brand-200 bg-brand-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-800 mb-2">
                    <Calendar size={16} /> Delivery Date
                  </label>
                  <input 
                    required
                    type="date" 
                    value={formData.deliveryDate}
                    onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 rounded-xl border border-brand-200 bg-brand-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100">
              <h3 className="font-serif text-2xl font-bold text-brand-900 mb-6 border-b border-brand-100 pb-4">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-brand-800 bg-brand-50">
                <CreditCard className="text-brand-800" size={24} />
                <div>
                  <h4 className="font-bold text-brand-900">Cash on Delivery</h4>
                  <p className="text-sm text-brand-600">Pay when your order arrives</p>
                </div>
                <div className="ml-auto">
                  <CheckCircle2 className="text-brand-800" size={24} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-900 text-white rounded-full font-bold text-lg hover:bg-brand-800 transition-colors shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Processing...' : `Place Order • ₹${calculateTotal()}`}
            </button>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-5">
          <div className="bg-brand-900 text-white p-8 rounded-3xl shadow-xl sticky top-28">
            <h3 className="font-serif text-2xl font-bold mb-8 border-b border-brand-800 pb-4">Order Summary</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg mb-1">{orderData.productName}</h4>
                  <p className="text-brand-300 text-sm capitalize">{orderData.orderType} Booking</p>
                </div>
                <span className="font-medium">₹{orderData.price}</span>
              </div>

              {orderData.orderType === 'custom' && (
                <div className="space-y-3 pt-4 border-t border-brand-800 text-sm text-brand-200">
                  {orderData.customSize && (
                    <div className="flex justify-between">
                      <span>Size Upgrade ({orderData.customSize})</span>
                      <span>+₹{calculateTotal() - orderData.price}</span>
                    </div>
                  )}
                  {orderData.customMessage && (
                    <div className="flex justify-between">
                      <span>Message</span>
                      <span className="italic text-right max-w-[150px] truncate">"{orderData.customMessage}"</span>
                    </div>
                  )}
                  {orderData.customDetails && (
                    <div className="flex justify-between">
                      <span>Details</span>
                      <span className="italic text-right max-w-[150px] truncate">{orderData.customDetails}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-brand-800 flex justify-between items-center">
              <span className="font-serif text-xl">Total Amount</span>
              <span className="font-serif text-3xl font-bold text-brand-200">₹{calculateTotal()}</span>
            </div>
            
            <p className="text-center text-sm text-brand-400 mt-8">
              Taxes and delivery charges calculated at checkout.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
