import TooltipUtils from "./Tooltip";

interface TopbarIconButtonProps {
  icon: React.ReactNode;
  count?: number;
  tooltip: string;
  onClick?: () => void;
}

export function TopbarIconButton({
  icon,
  count = 0,
  tooltip,
  onClick,
}: TopbarIconButtonProps) {
  return (
    <TooltipUtils text={tooltip}>
      <button
        onClick={onClick}
        className="relative hover:bg-gray-100 p-2 rounded-xl border transition cursor-pointer"
      >
        <span className="text-gray-600">{icon}</span>

        {count > 0 && (
          <span
            className="
          absolute -top-1 -right-1 bg-red-500 text-white text-xs
          min-w-5 h-5 rounded-full flex items-center justify-center px-1
        "
          >
            {count}
          </span>
        )}
      </button>
    </TooltipUtils>
  );
}
