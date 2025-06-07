import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">CourseForger</h3>
            <p className="text-sm">
              Revolutionizing course creation with the power of AI.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="hover:text-white">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
              {/* <li><Link href="#" className="hover:text-white">Demo</Link></li> */}
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white">About Us</Link></li>
              <li><Link href="#" className="hover:text-white">Contact</Link></li>
              {/* <li><Link href="#" className="hover:text-white">Careers</Link></li> */}
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} CourseForger. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {/* Placeholder for social icons */}
            {/* <Link href="#" className="hover:text-white">FB</Link> */}
            {/* <Link href="#" className="hover:text-white">TW</Link> */}
            {/* <Link href="#" className="hover:text-white">LN</Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
