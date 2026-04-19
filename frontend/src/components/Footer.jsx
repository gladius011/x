import { Heart, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span>Developed with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>by <strong className="text-gray-900 dark:text-white">Maryam Karim</strong></span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:maryamkarimbac@gmail.com"
              className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              maryamkarimbac@gmail.com
            </a>
            <a
              href="tel:+212 702-491230"
              className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +212 702-491230
            </a>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} VMA Calculator
          </p>
        </div>
      </div>
    </footer>
  );
}
