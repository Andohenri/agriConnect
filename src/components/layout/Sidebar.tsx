import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Map, 
  BarChart3, 
  User, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
};

const Sidebar = ({ isOpen, onClose, isMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/analytics', icon: BarChart3, label: 'Statistiques' },
    { path: '/products', icon: Package, label: user?.role === 'paysan' ? 'Mes Produits' : 'Produits' },
    { path: '/map', icon: Map, label: 'Carte' },
    { path: '/orders', icon: ShoppingCart, label: 'Commandes' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Mon Profil' },
  ];

  return (
    <div className={`
      ${isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
      ${isMobile ? 'fixed z-50' : 'fixed'}
      w-64 bg-linear-to-b from-green-800 to-green-900 text-white h-screen left-0 top-0 shadow-xl transition-transform duration-300
    `}>
      {/* Header */}
      <div className="p-6 border-b border-green-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🌾 AgriConnect
            </h1>
            <p className="text-green-200 text-sm mt-1">
              {user?.role === 'paysan' ? 'Espace Paysan' : 'Espace Collecteur'}
            </p>
          </div>
          {isMobile && (
            <button onClick={onClose} className="text-white">
              <X size={24} />
            </button>
          )}
        </div>
      </div>
      
      {/* Menu */}
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-6 py-3 hover:bg-green-700 transition
              ${isActive ? 'bg-green-700 border-l-4 border-yellow-400' : ''}
            `}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-green-700">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;