import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const OrderCardSkeleton = () => {
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {/* Image et infos principales */}
          <div className="flex items-start gap-4 flex-1">
            {/* Image skeleton */}
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />

            <div className="flex-1 min-w-0 space-y-2">
              {/* Titre */}
              <Skeleton className="h-6 w-3/4" />
              {/* Sous-titre */}
              <Skeleton className="h-4 w-1/2" />
              {/* Badge */}
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Bouton menu */}
            <Skeleton className="w-9 h-9 rounded-md shrink-0" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Informations utilisateur */}
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-28" />
        </div>

        {/* Informations de livraison */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
