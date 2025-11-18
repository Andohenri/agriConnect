import React from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "link";
}

interface EmptyStateProps {
  title: string;
  description?: string;
  media?: React.ReactNode;
  actions?: ActionButton[];
  linkAction?: ActionButton;
  isMe?:boolean
}

export function EmptyState({
  title,
  description,
  media,
  actions = [],
  linkAction,
  isMe
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        {media && <EmptyMedia variant="icon">{media}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>

      {actions.length > 0 && (
        <EmptyContent>
          <div className="flex gap-2">
            {actions.map((action, i) => {
              if (action.href) {
                return (
                  <Button
                    key={i}
                    asChild
                    variant={action.variant}
                    onClick={action.onClick}
                  >
                    <a href={action.href}>{action.label}</a>
                  </Button>
                );
              }
              return (
                <Button
                  key={i}
                  variant={action.variant}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </EmptyContent>
      )}

      {(linkAction && isMe) && (
        <Button
          variant={linkAction.variant || "link"}
          asChild={!!linkAction.href}
          size="sm"
          className="text-muted-foreground"
        >
          {linkAction.href ? (
            <a href={linkAction.href}>{linkAction.label}</a>
          ) : (
            linkAction.label
          )}
        </Button>
      )}
    </Empty>
  );
}
