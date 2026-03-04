import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-brand-800 tracking-tight">
                CheersWithSugar
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-brand-900 hover:text-brand-600 transition-colors font-medium">Home</Link>
              <Link to="/products" className="text-brand-900 hover:text-brand-600 transition-colors font-medium">Shop</Link>
              <Link to="/products?category=Custom" className="text-brand-900 hover:text-brand-600 transition-colors font-medium">Custom Cakes</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/products" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-800 hover:bg-brand-100 transition-colors">
                <ShoppingBag size={20} />
              </Link>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-brand-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-brand-200 px-4 py-4 space-y-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-brand-900 font-medium">Home</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block text-brand-900 font-medium">Shop</Link>
            <Link to="/products?category=Custom" onClick={() => setIsMenuOpen(false)} className="block text-brand-900 font-medium">Custom Cakes</Link>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-brand-900 text-brand-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">CheersWithSugar</h3>
            <p className="text-brand-200 max-w-xs">
              Delivering freshness, emotion, and celebration through every bite.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-brand-300">Quick Links</h4>
            <ul className="space-y-2 text-brand-200">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Custom" className="hover:text-white transition-colors">Custom Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-brand-300">Contact</h4>
            <ul className="space-y-2 text-brand-200">
              <li>hello@cheerswithsugar.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-brand-800 text-center text-brand-400 text-sm">
          &copy; {new Date().getFullYear()} CheersWithSugar. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
