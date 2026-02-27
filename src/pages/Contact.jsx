import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="pt-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">Get in <span className="text-blue-600">touch.</span></h2>
            <p className="text-slate-500 text-lg mb-12">Our medical coordinators are available 24/7 to assist with your inquiries and appointments.</p>
            
            <div className="space-y-8">
              {[
                { icon: <MapPin />, title: "Headquarters", detail: "123 Health Ave, Medical District, NY 1001" },
                { icon: <Phone />, title: "Support Line", detail: "+1 (555) 000-1234" },
                { icon: <Mail />, title: "Email Us", detail: "care@abchospital.com" },
                { icon: <Clock />, title: "Emergency", detail: "Available 24/7/365" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form Card */}
          

        {/* Professional Map Section */}
        <div className="mt-24 relative group">
          <div className="absolute -inset-2 bg-slate-200 rounded-[3rem] blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <iframe
            title="Hospital Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215!2d-73.985!3d40.748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzUyLjgiTiA3M8KwNTknMDYuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
            className="w-full h-[450px] rounded-[2.5rem] border-8 border-white shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
            </div>

  );
}