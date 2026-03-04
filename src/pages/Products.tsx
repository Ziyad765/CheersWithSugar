import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (categoryFilter) {
          setProducts(data.filter((p: any) => p.category === categoryFilter));
        } else {
          setProducts(data);
        }
      })
      .catch(console.error);
  }, [categoryFilter]);

  const categories = ['All', 'Cakes', 'Sweets', 'Custom'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="font-serif text-5xl font-bold text-brand-900 mb-4">Our Menu</h1>
          <p className="text-brand-600 max-w-2xl text-lg">
            Browse our selection of freshly baked cakes, traditional sweets, and custom creations.
          </p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                if (cat === 'All') {
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                } else {
                  setSearchParams({ category: cat });
                }
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                (categoryFilter === cat || (!categoryFilter && cat === 'All'))
                  ? 'bg-brand-900 text-white'
                  : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group"
          >
            <Link to={`/products/${product.id}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-2xl mb-4 bg-brand-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {product.isCustomizable && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-brand-800 shadow-sm">
                    Customizable
                  </div>
                )}
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-900 mb-1 group-hover:text-brand-600 transition-colors">{product.name}</h3>
                  <p className="text-brand-500 text-sm">{product.category}</p>
                </div>
                <span className="font-medium text-brand-900">₹{product.price}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-24 text-brand-500">
          No products found in this category.
        </div>
      )}
    </div>
  );
}
