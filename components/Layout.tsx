
import React from 'react';

const Header: React.FC = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
        <i className="fa-solid fa-cross text-white text-xl"></i>
      </div>
      <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
        QTIANS <span className="text-blue-600">LEAGUE</span>
      </h1>
    </div>
    {/* Navigation removed as requested */}
  </header>
);

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-slate-200 mt-20 py-12 px-6 text-center text-slate-500">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-slate-900 font-bold text-lg mb-4">대한예수교장로회 안산동산교회 비전랜드</h2>
      <p className="text-sm mb-2">15585 경기도 안산시 상록구 석호공원로 8 (사1동)</p>
      <div className="flex justify-center gap-6 text-sm mb-8">
        <span>Tel: 031-400-1111</span>
        <span>Fax: 031-400-1122</span>
      </div>
      <div className="flex justify-center gap-4 mb-8">
        <a 
          href="https://www.youtube.com/@%EC%95%88%EC%82%B0%EB%8F%99%EC%82%B0%EA%B5%90%ED%9A%8C%EA%B5%90%ED%9A%8C-i9l" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
          aria-label="YouTube"
        >
          <i className="fa-brands fa-youtube"></i>
        </a>
        <a 
          href="https://www.instagram.com/dongsan_visionland/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
          aria-label="Instagram"
        >
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a 
          href="https://www.d21.org/default.aspx" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
          aria-label="Website"
        >
          <i className="fa-solid fa-globe"></i>
        </a>
      </div>
      <p className="text-xs uppercase tracking-widest">Copyright &copy; 2026 Ansan Dongsan Church. All Rights Reserved.</p>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};