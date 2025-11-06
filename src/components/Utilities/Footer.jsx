import { motion as Motion } from "framer-motion";
import { Facebook, Instagram, Mail, Phone, MapPin, Send } from "lucide-react";
import Colors from "../../utils/Colors";
import Images from "../../utils/Images";

const Footer = () => {
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#" },
    { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>, href: "#" },
    { icon: <Instagram className="w-5 h-5" />, href: "#" },
  ];

  return (
    <footer className="bg-[#0f172a] text-white border-t border-neutral-800">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <img src={Images.logo_alt} alt="Quick Rent Logo" className="h-12" />
            <p className="text-neutral-300 text-lg leading-relaxed">
              Your trusted partner in finding the perfect home in Ghana. We make property hunting simple, secure, and enjoyable.
            </p>
            <div className="pt-4">
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                {socialLinks.map((link, index) => (
                  <Motion.a
                    key={index}
                    href={link.href}
                    className="p-3 rounded-full bg-neutral-800 text-white hover:bg-primary-600 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {link.icon}
                  </Motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-xl">Get In Touch</h3>
            <div className="space-y-4">
              <a 
                href="tel:+233500000000" 
                className="flex items-center gap-3 text-neutral-300 hover:text-primary-300 transition-colors group"
              >
                <div className="p-2 rounded-full bg-neutral-800 group-hover:bg-primary-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Call Us</p>
                  <p className="text-white">+233 50 000 0000</p>
                </div>
              </a>

              <a 
                href="mailto:info@quickrent.com" 
                className="flex items-center gap-3 text-neutral-300 hover:text-primary-300 transition-colors group"
              >
                <div className="p-2 rounded-full bg-neutral-800 group-hover:bg-primary-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Email Us</p>
                  <p className="text-white">info@quickrent.com</p>
                </div>
              </a>

              <div className="flex items-start gap-3 text-neutral-300">
                <div className="p-2 rounded-full bg-neutral-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Visit Us</p>
                  <p className="text-white">
                    123 Independence Avenue<br />
                    Accra, Ghana
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-300">
            © {new Date().getFullYear()} Quick Rent. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer; 