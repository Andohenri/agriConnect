import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationsList } from "./NotificationsList";
import notifService, {
  type UserNotification,
} from "@/service/notification.service";
import { useNotifications } from "@/contexts/NotificationContext";

interface NotificationsSheetProps {
  trigger: React.ReactNode; // bouton TopbarIconButton
}

export function NotificationsSheet({ trigger }: NotificationsSheetProps) {
  const [active, setActive] = useState<"all" | "unread">("all");
  // const { notifications: notif } = useNotifications();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  async function fetchNotif() {
    const res = await notifService.getAll();
    setNotifications(res);
  }

  return (
    <Sheet onOpenChange={(open) => open && fetchNotif()}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-80 gap-0">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        {/* SECTION FILTER */}
        <div className="border-b">
          <NotificationsFilter active={active} setActive={setActive} />
        </div>

        <ScrollArea className="h-[80vh]">
          {/* Ton contenu ici */}
          <NotificationsList notifications={notifications} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function NotificationsFilter({
  active,
  setActive,
}: {
  active: string;
  setActive: (value: "all" | "unread") => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-10">
      {/* BOUTON : Tout */}
      <span
        onClick={() => setActive("all")}
        className={cn(
          "px-3 py-1 text-[14px] rounded-lg transition cursor-pointer",
          active === "all" ? "text-gray-900" : "text-gray-500"
        )}
      >
        Tout
      </span>

      {/* BOUTON : Non lu */}
      <span
        onClick={() => setActive("unread")}
        className={cn(
          "px-3 py-1 text-[14px] rounded-lg transition cursor-pointer",
          active === "unread" ? "text-gray-900 " : "text-gray-500 "
        )}
      >
        Non lu
      </span>
    </div>
  );
}
