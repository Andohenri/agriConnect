import type { UserNotification } from "@/service/notification.service";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "./EmptyState";
import { BellDot, BellOff } from "lucide-react";

interface NotificationsListProps {
  notifications: Array<UserNotification>;
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="Aucune notification"
        description="Vous n’avez pas encore de notifications. Elles apparaîtront ici dès qu’il y en aura."
        media={<BellOff />}
      />
    );
  }

  return (
    <div className="space-y-0">
      {notifications.map((n) => (
        <NotificationItem key={n.id} {...n} />
      ))}
    </div>
  );
}
