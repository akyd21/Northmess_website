import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 dark:bg-dark-950 text-dark-300">
      {/* Top Wave */}
      <div className="relative">
        <svg className="w-full h-12 text-white dark:text-dark-950" viewBox="0 0 1440 48" fill="none">
          <path d="M0 0L60 4C120 8 240 16 360 21.3C480 26.7 600 29.3 720 26.7C840 24 960 16 1080 13.3C1200 10.7 1320 13.3 1380 14.7L1440 16V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">N</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">North Mess</h3>
                <p className="text-xs text-dark-400">Management System</p>
              </div>
            </div>
            <p className="text-sm text-dark-400 leading-relaxed mb-4">
              Healthy Food, Healthy Mind, Happy Students. Providing quality dining experiences for our hostel community.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-dark-800 hover:bg-primary-600 transition-colors" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-dark-800 hover:bg-primary-600 transition-colors" aria-label="Twitter">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-dark-800 hover:bg-primary-600 transition-colors" aria-label="Facebook">
                <FaFacebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/menu', label: "Today's Menu" },
                { to: '/staff', label: 'Our Staff' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Students</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/register', label: 'Register' },
                { to: '/login', label: 'Login' },
                { to: '/feedback', label: 'Submit Feedback' },
                { to: '/complaints', label: 'Complaints' },
                { to: '/announcements', label: 'Announcements' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 text-primary-500 flex-shrink-0" size={16} />
                <span className="text-sm text-dark-400">North Hostel, University Campus, Main Road, City - 600001</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary-500 flex-shrink-0" size={16} />
                <span className="text-sm text-dark-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary-500 flex-shrink-0" size={16} />
                <span className="text-sm text-dark-400">northmess@university.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-dark-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-500">
              © {currentYear} North Mess Management System. All rights reserved.
            </p>
            <p className="text-sm text-dark-500 flex items-center gap-1">
              Made with <FiHeart className="text-red-500" size={14} /> ak for students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
