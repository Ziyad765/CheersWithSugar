import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // Simple polling for new orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Order #${id} marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-50 text-brand-800">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-brand-50 font-sans">
      {/* Admin Header */}
      <header className="bg-brand-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-brand-300" />
            <h1 className="font-serif text-2xl font-bold tracking-wide">CheersWithSugar Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-brand-300">Live Updates Active</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Revenue', value: `₹${orders.reduce((acc, o) => acc + o.totalPrice, 0)}`, icon: Package, color: 'text-brand-600', bg: 'bg-brand-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-200 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-brand-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-brand-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={20} className="text-brand-500" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-brand-50 border border-brand-200 text-brand-800 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 outline-none"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-brand-400" />
            </div>
            <input 
              type="text" 
              className="bg-brand-50 border border-brand-200 text-brand-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-2.5 outline-none" 
              placeholder="Search orders..." 
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-brand-200 text-brand-500">
              No orders found matching your criteria.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-brand-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    
                    {/* Customer Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Order #{order.id}
                        </span>
                        <span className="text-sm text-brand-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-brand-500 uppercase font-semibold mb-1">Customer</p>
                          <p className="font-medium text-brand-900">{order.customerName}</p>
                          <p className="text-sm text-brand-600">{order.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-brand-500 uppercase font-semibold mb-1">Delivery</p>
                          <p className="font-medium text-brand-900">{order.deliveryDate}</p>
                          <p className="text-sm text-brand-600 truncate" title={order.customerLocation}>{order.customerLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 bg-brand-50 p-4 rounded-xl border border-brand-100">
                      <p className="text-xs text-brand-500 uppercase font-semibold mb-2">Order Details</p>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-brand-900">{order.productName}</p>
                        <p className="font-bold text-brand-900">₹{order.totalPrice}</p>
                      </div>
                      
                      <div className="text-sm text-brand-700 space-y-1">
                        <p><span className="font-medium">Type:</span> <span className="capitalize">{order.orderType}</span></p>
                        {order.orderType === 'custom' && (
                          <>
                            {order.customSize && <p><span className="font-medium">Size:</span> {order.customSize}</p>}
                            {order.customMessage && <p><span className="font-medium">Message:</span> "{order.customMessage}"</p>}
                            {order.customDetails && <p><span className="font-medium">Notes:</span> {order.customDetails}</p>}
                          </>
                        )}
                        <p className="pt-2 mt-2 border-t border-brand-200"><span className="font-medium">Payment:</span> Cash on Delivery</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col justify-between lg:justify-center gap-3 min-w-[140px]">
                      <div className="mb-2 text-center lg:text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'pending' && <Clock size={12} />}
                          {order.status === 'delivered' && <CheckCircle2 size={12} />}
                          {order.status === 'cancelled' && <XCircle size={12} />}
                          {order.status}
                        </span>
                      </div>
                      
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'confirmed')}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button 
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
