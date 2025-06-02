import React from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-md ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
       
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">IntelliPM</span>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Projects</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Docs</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden md:inline-flex bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition">
              Sign In
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

 
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col space-y-2 px-4 py-4">
            <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Projects</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Docs</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
            <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition">
              Sign In
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
