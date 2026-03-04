import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Gift, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setFeatured(data.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=2000&ixlib=rb-4.0.3" 
            alt="Delicious cake" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Delivering Happiness <br className="hidden md:block" />
            <span className="italic font-light text-brand-200">With Every Order</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-brand-100 mb-10 max-w-2xl mx-auto font-light"
          >
            Freshly baked cakes, custom photo cakes, and festival sweet boxes delivered right to your doorstep.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/products" 
              className="px-8 py-4 bg-white text-brand-900 rounded-full font-medium hover:bg-brand-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Order Now <ArrowRight size={18} />
            </Link>
            <Link 
              to="/products?category=Custom" 
              className="px-8 py-4 bg-transparent border border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Custom Cakes
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Clock, title: "Same-Day Delivery", desc: "Freshness guaranteed" },
              { icon: Star, title: "Premium Quality", desc: "Finest ingredients" },
              { icon: Gift, title: "Custom Orders", desc: "Made just for you" },
              { icon: Heart, title: "Made with Love", desc: "Emotional branding" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-brand-100"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-serif font-bold text-xl text-brand-900 mb-2">{feature.title}</h3>
                <p className="text-brand-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl font-bold text-brand-900 mb-4">Featured Delights</h2>
              <p className="text-brand-600 max-w-2xl">Handcrafted with passion, our most loved creations are ready to make your celebrations sweeter.</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-brand-700 font-medium hover:text-brand-900 transition-colors">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={`/products/${product.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6 bg-brand-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-brand-900 mb-1 group-hover:text-brand-600 transition-colors">{product.name}</h3>
                      <p className="text-brand-500 text-sm">{product.category}</p>
                    </div>
                    <span className="font-medium text-brand-900 text-lg">₹{product.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-brand-700 font-medium hover:text-brand-900 transition-colors">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Orders CTA */}
      <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=1950&ixlib=rb-4.0.3" 
            alt="Baking" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Have a Special Request?</h2>
          <p className="text-brand-200 text-lg mb-10 max-w-2xl mx-auto">
            From photo cakes to multi-tier wedding cakes, our expert bakers can bring your imagination to life.
          </p>
          <Link 
            to="/products?category=Custom" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-900 rounded-full font-medium hover:bg-brand-50 transition-colors shadow-lg"
          >
            Start Custom Order
          </Link>
        </div>
      </section>
    </div>
  );
}
