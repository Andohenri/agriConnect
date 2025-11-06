import { Search, Bell, Menu, MessageSquare } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Tooltip from "../composant/Tooltip";
import SearchInput from "../composant/SearchInput";
import UserAvatar from "../composant/Avatar";

type TopBarProps = {
  onMenuClick: () => void;
  isMobile: boolean;
};

const TopBar = ({ onMenuClick, isMobile }: TopBarProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b px-4 md:px-8 py-1 flex justify-between items-center gap-2">
      <div className="flex items-center gap-4 flex-1">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2">
            <Menu size={24} />
          </button>
        )}
        <SearchInput isMobile={isMobile} />
      </div>

      <div className="flex items-center gap-3 md:gap-6">
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
          <div className="p-2 md:flex items-center cursor-pointer gap-2 ">
            <UserAvatar fallback={user?.nom?.charAt(0) || "U"} />
            <div className="hidden md:block">
              <p className="font-semibold text-sm">
                Baba Code
              </p>
              <p className="text-[10px] text-gray-500 capitalize">Collecteur</p>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default TopBar;
