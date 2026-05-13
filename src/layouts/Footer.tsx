import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-heading text-neutral-secondary-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SA</span>
              </div>
              <span className="text-lg font-bold text-white">SnippetApp</span>
            </div>
            <p className="text-neutral-tertiary mb-4">
              Create, share, and manage code snippets with ease.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-neutral-tertiary hover:text-brand transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-neutral-tertiary hover:text-brand transition-colors">Pricing</a></li>
              <li><a href="#docs" className="text-neutral-tertiary hover:text-brand transition-colors">Documentation</a></li>
              <li><a href="#api" className="text-neutral-tertiary hover:text-brand transition-colors">API</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-neutral-tertiary hover:text-brand transition-colors">About Us</a></li>
              <li><a href="#blog" className="text-neutral-tertiary hover:text-brand transition-colors">Blog</a></li>
              <li><a href="#careers" className="text-neutral-tertiary hover:text-brand transition-colors">Careers</a></li>
              <li><a href="#press" className="text-neutral-tertiary hover:text-brand transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-brand" />
                <a href="mailto:hello@snippetapp.com" className="text-neutral-tertiary hover:text-brand transition-colors">hello@snippetapp.com</a>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-brand" />
                <a href="tel:+1234567890" className="text-neutral-tertiary hover:text-brand transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-brand" />
                <span className="text-neutral-tertiary">San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-tertiary mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-tertiary text-sm">
            © {currentYear} SnippetApp. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#privacy" className="text-neutral-tertiary hover:text-brand transition-colors text-sm">Privacy Policy</a>
            <a href="#terms" className="text-neutral-tertiary hover:text-brand transition-colors text-sm">Terms of Service</a>
            <a href="#cookies" className="text-neutral-tertiary hover:text-brand transition-colors text-sm">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
