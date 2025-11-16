import type { UserNotification } from "@/service/notification.service";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "./EmptyState";
import { BellDot, BellOff } from "lucide-react";

interface NotificationsListProps {
  notifications: Array<UserNotification>;
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  if (notifications.length !== 0) {
    return (
      <EmptyState
        title="Aucune notification"
        description="Vous n’avez pas encore de notifications. Elles apparaîtront ici dès qu’il y en aura."
        media={<BellOff />}
        // actions={[
        //   { label: "Create Project", onClick: () => console.log("Create") },
        //   { label: "Import Project", onClick: () => console.log("Import"), variant: "outline" },
        // ]}
        // linkAction={{ label: "Learn More", href: "#", variant: "link" }}
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
