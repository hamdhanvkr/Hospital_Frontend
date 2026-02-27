import React from "react";
import { CheckCircle2, Heart, Activity, Shield, Microscope } from "lucide-react";

const services = [
  { title: "Cardiology", desc: "Advanced cardiac imaging and intervention.", icon: <Heart className="text-red-500" /> },
  { title: "Pediatrics", desc: "Comprehensive wellness for the next generation.", icon: <Activity className="text-blue-500" /> },
  { title: "Diagnostics", desc: "Precision labs with AI-assisted screening.", icon: <Microscope className="text-indigo-500" /> },
  { title: "Neurology", desc: "Specialized treatment for complex brain health.", icon: <Shield className="text-emerald-500" /> },
];

export default function About() {
  return (
    <div className="pt-24 bg-white">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center lg:text-left">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-blue-600 font-black tracking-widest text-xs uppercase bg-blue-50 px-3 py-1 rounded-full">Our Legacy</span>
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mt-6 mb-8 tracking-tight leading-none">
              Pioneering the future of <span className="text-blue-600">care.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              Since 1990, ABC Care has evolved from a local clinic into a global leader in medical innovation. We bridge the gap between high-tech diagnostics and the essential human touch.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {["Accredited Surgeons", "AI Diagnostics", "Global Network", "24/7 Support"].map((item) => (
                <div key={item} className="flex items-center space-x-2 text-slate-700 font-bold">
                  <CheckCircle2 className="text-blue-600 w-5 h-5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-blue-100/50 rounded-[2.5rem] blur-2xl"></div>
             <img 
               src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200" 
               className="relative rounded-[2rem] shadow-2xl border-4 border-white object-cover aspect-video" 
               alt="Team" 
             />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-slate-900">Medical Specialities</h3>
            <p className="text-slate-500 mt-2">World-class expertise across all major departments.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}