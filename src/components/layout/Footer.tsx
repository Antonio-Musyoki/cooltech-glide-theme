import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  products: [
    { name: "Ice Block Machines", path: "/shop?category=ice-block" },
    { name: "Popsicle Machines", path: "/shop?category=popsicle" },
    { name: "Ice Cream Equipment", path: "/shop?category=ice-cream" },
    { name: "Cooler Boxes", path: "/shop?category=coolers" },
    { name: "Milk ATM", path: "/shop?category=atm" },
  ],
  services: [
    { name: "Cold Room Assembly", path: "/services#cold-room" },
    { name: "HVAC Systems", path: "/services#hvac" },
    { name: "AC Maintenance", path: "/services#ac" },
    { name: "Refrigeration Repair", path: "/services#repair" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "FAQs", path: "/faqs" },
    { name: "Blog", path: "/blog" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">CT</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">CoolTech</h3>
                <p className="text-sm text-background/60">Refrigeration & AC</p>
              </div>
            </div>
            <p className="text-background/70 text-sm mb-6 leading-relaxed">
              Kenya's trusted partner for refrigeration, cold rooms, HVAC systems, and ice production equipment. Quality solutions for commercial and residential needs.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-base mb-5">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-primary-light transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-base mb-5">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-primary-light transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-base mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+254707154948" className="flex items-start gap-3 text-background/70 hover:text-primary-light transition-colors">
                  <Phone className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="text-sm">
                    +254 707 154 948<br />
                    +254 719 110 722
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:info@cooltechrefrigeration.co.ke" className="flex items-start gap-3 text-background/70 hover:text-primary-light transition-colors">
                  <Mail className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="text-sm">info@cooltechrefrigeration.co.ke</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-background/70">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm">
                  PO BOX 317 – 00610<br />
                  Nairobi, Kenya
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm text-center md:text-left">
            © {new Date().getFullYear()} CoolTech Refrigeration Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-background/60 hover:text-primary-light transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-background/60 hover:text-primary-light transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
