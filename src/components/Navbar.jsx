import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Change navbar background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-lg shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand/Logo */}
        <Link to="/" className="group flex items-center space-x-3">
          <div className="relative">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
              +
            </div>
            <div className="absolute -inset-1 bg-blue-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800 uppercase">
            ABC <span className="text-blue-600">Care</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                location.pathname === link.path
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-6 w-[1px] bg-slate-200 mx-4"></div>

          <Link 
            to="/login" 
            className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-7 py-3 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-slate-800 rounded-full transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-0.5 w-full bg-slate-800 rounded-full transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full bg-slate-800 rounded-full transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 top-[72px] bg-white z-40 md:hidden transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-8 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-2xl font-bold text-slate-800 border-b border-slate-50 pb-2"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-6 flex flex-col space-y-4">
            <Link 
              to="/login" 
              className="w-full py-4 text-center font-bold text-slate-700 border-2 border-slate-100 rounded-2xl"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="w-full py-4 text-center font-bold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-100"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}