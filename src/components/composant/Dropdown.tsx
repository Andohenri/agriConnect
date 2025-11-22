import React, { useState, cloneElement, type ReactNode, type ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  children: ReactNode;
  btnShow: ReactNode;
  style?: string;
  down?: boolean;
  open?: boolean;
  setOpen?: (value: boolean) => void;
  className?: string;
}
type DropdownChild = ReactElement<DropdownProps>;

export default function Dropdown({
  children,
  btnShow,
  style,
  down,
  open: externalOpen,
  setOpen: externalSetOpen,
  className,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = externalSetOpen ?? setInternalOpen;

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return cloneElement(child as DropdownChild, { setOpen });
    }
    return child;
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <div
          className={cn(
            "flex items-center justify-center rounded-md transition-all duration-300",
            style
          )}
        >
          {btnShow}
          {down && <ChevronDown className="w-4 h-4" />}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={cn("flex flex-col mx-4", className)}>
        {enhancedChildren}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DropdownItemProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  style?: string;
  className?: string;
  onclick?: () => void;
  setOpen?: (value: boolean) => void;
}

export const DropdownItems: React.FC<DropdownItemProps> = ({
  icon,
  title,
  description,
  style,
  className,
  onclick,
  setOpen,
}) => {
  return (
    <DropdownMenuItem
      className={cn("flex gap-3 py-2 mx-1 cursor-pointer", className)}
      onClick={(e) => {
        e.stopPropagation();
        onclick?.();
        setOpen?.(false);
      }}
    >
      {icon}
      <div className="flex flex-col">
        <div className={cn("font-sans flex items-center font-medium", style)}>
          {title}
        </div>
        {description && (
          <span className="text-xs text-gray-400">{description}</span>
        )}
      </div>
    </DropdownMenuItem>
  );
};
