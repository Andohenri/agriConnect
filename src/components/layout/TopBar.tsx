import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type TopBarProps = {
  onMenuClick: () => void;
  isMobile: boolean;
};

const TopBar = ({ onMenuClick, isMobile }: TopBarProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-md px-4 md:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4 flex-1">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2">
            <Menu size={24} />
          </button>
        )}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={isMobile ? "Rechercher..." : "Rechercher des produits, paysans, collecteurs..."} 
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative hover:bg-gray-100 p-2 rounded-full transition">
          <Bell size={24} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        
        <div className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full">
          <div className="w-10 h-10 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.nom?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {user?.nom} {user?.prenom}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;