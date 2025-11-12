import { Bell, Menu, MessageSquare, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Tooltip from "../composant/Tooltip";
import UserAvatar from "../composant/Avatar";
import SearchCommand from "../composant/SearchCommand";
import { Link } from "react-router-dom";

type TopBarProps = {
  onMenuClick: () => void;
  isMobile: boolean;
};

const TopBar = ({ onMenuClick, isMobile }: TopBarProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b px-4 md:px-8 py-1 flex justify-between md:justify-end items-center gap-4 shadow-sm fixed top-0 right-0 transition-all duration-300 md:left-64 left-0 z-10 h-16">
      <div className="flex items-center justify-between gap-2 md:mr-4">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2">
            <Menu size={20} />
          </button>
        )}
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 z-20 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <SearchCommand className="pl-10" placeholder={isMobile ? "" : "Rechercher des produits, paysans, collecteurs..."}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Tooltip text="Notifications">
          <button className="relative hover:bg-gray-100 p-2 rounded-xl border transition cursor-pointer">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </Tooltip>
        <Tooltip text="Messages">
          <button className="relative hover:bg-gray-100 p-2 rounded-xl border transition cursor-pointer">
            <MessageSquare size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </Tooltip>
        <Tooltip text="Profile">
          <Link to="/profile">
            <div className="px-2 py-1.5 bg-gray-100 rounded-full md:flex items-center cursor-pointer gap-2">
              <UserAvatar src={user?.avatar} fallback={user?.nom?.charAt(0) || "U"} />
              <div className="hidden md:block px-2">
                <p className="font-semibold text-sm">
                  {user?.nom}
                </p>
                <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </Link>
        </Tooltip>
      </div>
    </div>
  );
};

export default TopBar;
