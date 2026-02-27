import React from "react";

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-50 to-blue-50 py-20 lg:py-32">
        {/* Floating Decorative Orbs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-blue-600 uppercase bg-blue-100/50 rounded-full">
              Trust in Care
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
              Modern Healthcare <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500">
                Redefined.
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Managing health has never been easier. Connect with world-class specialists and access your medical history in one secure dashboard.
            </p>
            
          </div>

          {/* Visual Content */}
          <div className="relative">
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" 
                alt="Medical tech"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-20 animate-bounce-slow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">✔</div>
                <div>
                  <p className="text-xl font-black text-slate-800">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}