import { type ReactElement } from "react";
import clsx from "clsx";
import { Search } from "lucide-react";

export interface SearchInputProps {
  placeholder?: string;
  isMobile?: boolean;
  classNames?: string[];
  style?: object;
  icon?: ReactElement; // optionnel si tu veux changer l’icône
}

const defaultStyle = {};

const SearchInput = ({
  placeholder,
  isMobile = false,
  classNames = [],
  style = defaultStyle,
  
  icon = <Search size={20} className="text-gray-400" />,
}: SearchInputProps) => {
  
  const wrapperClasses = [
    "relative",
    "flex-1",
    "max-w-xl"
  ];

  return (
    <div className={clsx(wrapperClasses.concat(classNames))} style={style}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        {icon}
      </div>

      <input
        type="text"
        placeholder={
          placeholder ??
          (isMobile
            ? "Rechercher..."
            : "Rechercher des produits, paysans, collecteurs..."
          )
        }
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
};

export default SearchInput;
