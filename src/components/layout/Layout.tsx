import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Overlay pour mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />
      
      {/* Contenu principal */}
      <div className={`${isMobile ? 'ml-0' : 'ml-64'} transition-all duration-300`}>
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
        
        {/* Zone de contenu dynamique */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;