import { cn, timeAgo } from "@/lib/utils";
import type { UserNotification } from "@/service/notification.service";
import { BadgeCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  id: string;
  title: string;
  content: string;
  date: string;
  source?: string;
  isRead?: boolean;
  avatar?: string;
}

type NotificationType =
  | "commande"
  | "paiement"
  | "message"
  | "systeme"
  | "alerte";

interface NotificationItemdd {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  lien?: string;
  reference_id?: string;
  reference_type?: string;
  createdAt: string;
  userNotification: {
    id: string;
    lu: boolean;
    dateLecture?: string;
  };
}

export function NotificationItem(notify: UserNotification) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "flex gap-3 p-3 border-b transition cursor-pointer",
        !notify.lu && "bg-gray-50 border-gray-300",
        notify.lu && "bg-white hover:bg-gray-50"
      )}
      onClick={() => navigate(notify.notification.lien as string)}
    >
      {/* Avatar ou Icône */}
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {notify.notification.reference_id ? (
          <img
            src={`${import.meta.env.VITE_UPLOAD_URL}${
              notify.notification.reference_id
            }`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <BadgeCheck className="text-gray-500" size={20} />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1">
        <p className="text-sm font-medium line-clamp-1">
          {notify.notification.titre}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notify.notification.message}
        </p>

        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Clock size={12} />
          {timeAgo(notify.notification.createdAt)}
        </div>
      </div>
    </div>
  );
}
