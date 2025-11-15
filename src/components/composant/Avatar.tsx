import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  src?: string; // chemin avatar backend (ex: /uploads/avatars/xxx.jpeg)
  preview?: string; // preview locale avant upload
  fallback?: string; // texte fallback si pas d'image
  classNames?: string[];
  style?: React.CSSProperties;
}

const defaultStyle = {};

const UserAvatar = ({
  src,
  preview,
  fallback = "👤",
  classNames = [],
  style = defaultStyle,
}: UserAvatarProps) => {
  // Priorité : preview > src > fallback
  const imageSrc = preview || (src ? `${import.meta.env.VITE_UPLOAD_URL}${src}` : undefined);

  return (
    <div className={cn("inline-flex", classNames)} style={style}>
      <Avatar>
        {imageSrc ? (
          <AvatarImage src={imageSrc} />
        ) : null}
        <AvatarFallback className="text-white font-bold bg-linear-to-br from-green-400 to-green-600">
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserAvatar;
