import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  src?: string;
  fallback?: string;
  classNames?: string[];
  style?: object;
}

const defaultStyle = {};

const UserAvatar = ({
  src,
  fallback = "??",
  classNames = [],
  style = defaultStyle,
}: UserAvatarProps) => {

  return (
    <div className={cn("inline-flex", classNames)} style={style}>
      <Avatar>
        <AvatarImage  src={src} />
        <AvatarFallback className="text-white font-bold bg-linear-to-br from-green-400 to-green-600 ">{fallback}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserAvatar;
