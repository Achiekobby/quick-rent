import { motion as Motion } from "framer-motion";
import { Facebook, Instagram, Mail, Phone, MapPin, Send } from "lucide-react";
import Colors from "../../utils/Colors";
import Images from "../../utils/Images";

const Footer = () => {
  const footerLinks = {
    company: [
      { name: "About Us", href: "#" },
      { name: "Our Team", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    properties: [
      { name: "For Rent", href: "#" },
      { name: "For Sale", href: "#" },
      { name: "New Projects", href: "#" },
      { name: "Featured", href: "#" },
    ],
    resources: [
      { name: "Blog", href: "#" },
      { name: "Guides", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Help Center", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#" },
    { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>, href: "#" },
    { icon: <Instagram className="w-5 h-5" />, href: "#" },
  ];

  return (
    <footer className="bg-[#0f172a] text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img src={Images.logo} alt="Quick Rent Logo" className="h-12 mb-6" />
            <p className="text-neutral-300 text-sm mb-6">
              Your trusted partner in finding the perfect home in Ghana. We make property hunting simple, secure, and enjoyable.
            </p>
          </div>

          {/* Quick Links - First Two Sections */}
          {Object.entries(footerLinks).slice(0, 2).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4 capitalize">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-300 hover:text-primary-300 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact & Social</h3>
            <div className="space-y-3 mb-6">
              <a href="tel:+233500000000" className="flex items-center gap-2 text-sm text-neutral-300 hover:text-primary-300">
                <Phone className="w-4 h-4" />
                +233 50 000 0000
              </a>
              <a href="mailto:info@quickrent.com" className="flex items-center gap-2 text-sm text-neutral-300 hover:text-primary-300">
                <Mail className="w-4 h-4" />
                info@quickrent.com
              </a>
              <p className="flex items-center gap-2 text-sm text-neutral-300">
                <MapPin className="w-4 h-4" />
                123 Independence Avenue<br />
                Accra, Ghana
              </p>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((link, index) => (
                <Motion.a
                  key={index}
                  href={link.href}
                  className="p-2 rounded-full bg-neutral-800 text-white hover:bg-primary-600 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {link.icon}
                </Motion.a>
              ))}
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