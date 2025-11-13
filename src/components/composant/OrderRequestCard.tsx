import {
  Calendar,
  Eye,
  MessageSquare,
  MoreVertical,
  Package,
  ShoppingCart,
  Target,
  Truck,
  User,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatPrice, ORDER_STATUT_CONFIG, UNITE_LABELS } from "@/lib/utils";
import { Button } from "../ui/button";
import { CommandeStatut, StatutCommandeLigne, Role } from "@/types/enums";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface OrderRequestCardProps {
  order: Order;
  userRole?: Role;
  onAcceptLine: (orderId: string, lineId: string) => void;
  onRejectLine: (orderId: string, lineId: string) => void;
  onContact: (userId: string) => void;
  onViewDetails: (orderId: string) => void;
}

const OrderRequestCard = ({
  order,
  userRole,
  onContact,
  onViewDetails,
}: OrderRequestCardProps) => {
  const statutConfig = ORDER_STATUT_CONFIG[order.statut || CommandeStatut.OUVERTE];
  const StatusIcon = statutConfig.icon;
  const acceptedLines =
    order.lignes?.filter((l) => l.statutLigne === StatutCommandeLigne.ACCEPTEE) || [];
  const totalAccepted = acceptedLines.reduce(
    (sum, line) => sum + Number(line.quantiteFournie),
    0
  );
  const progress = (totalAccepted / Number(order.quantiteTotal)) * 100;

  // Compter les propositions par statut
  const nbPropositions = order.lignes?.length || 0;
  const nbAcceptees = order.lignes?.filter(
    (l) => l.statutLigne === StatutCommandeLigne.ACCEPTEE
  ).length || 0;
  const nbEnAttente = order.lignes?.filter(
    (l) => l.statutLigne === StatutCommandeLigne.EN_ATTENTE
  ).length || 0;
  const nbRejetees = order.lignes?.filter(
    (l) => l.statutLigne === StatutCommandeLigne.REJETEE
  ).length || 0;

  // Pour le paysan: trouver sa proposition
  const maPropre = order.lignes?.find(
    (l) => l.produit?.paysan?.id === userRole // À adapter selon votre logique
  );

  return (
    <Card className="hover:shadow-md gap-0! transition-all duration-300 cursor-pointer group overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          {/* Informations principales */}
          <div className="flex items-start gap-4 flex-1">
            {/* Icône */}
            <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-4xl shrink-0 group-hover:scale-105 transition-transform">
              🎯
            </div>

            <div className="flex-1 min-w-0">
              {/* Titre et statut */}
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold line-clamp-1">
                    {order.produitRecherche}
                  </h3>
                  <p className="text-xs text-gray-500">Demande de produit</p>
                </div>

                {/* Menu Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Voir les détails - Toujours visible */}
                    <DropdownMenuItem onClick={() => onViewDetails(order.id!)}>
                      <Eye size={16} className="mr-2" />
                      Voir les détails complets
                    </DropdownMenuItem>

                    {/* Contacter le collecteur */}
                    {order.collecteur && userRole === Role.PAYSAN && (
                      <DropdownMenuItem onClick={() => onContact(order.collecteurId)}>
                        <MessageSquare size={16} className="mr-2" />
                        Contacter le collecteur
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge className={statutConfig.color}>
                <StatusIcon size={12} className="mr-1" />
                {statutConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className="space-y-4"
        onClick={() => onViewDetails(order.id!)}
      >
        {/* Informations essentielles */}
        <div className="space-y-1.5 text-sm">
          {/* Collecteur */}
          {order.collecteur && (
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} className="text-blue-600 shrink-0" />
              <span className="font-medium">
                {order.collecteur.nom} {order.collecteur.prenom}
              </span>
            </div>
          )}

          {/* Zone de recherche */}
          <div className="flex items-center gap-2 text-gray-600">
            <Target size={14} className="text-blue-600 shrink-0" />
            <span className="line-clamp-1">{order.territoire}</span>
            <span className="text-gray-400">•</span>
            <span className="text-xs font-medium">{order.rayon} km</span>
          </div>

          {/* Quantité recherchée */}
          <div className="flex items-center gap-2 text-gray-600">
            <Package size={14} className="text-blue-600 shrink-0" />
            <span className="font-semibold">
              {order.quantiteTotal} {order.unite && UNITE_LABELS[order.unite]} recherchés
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} className="shrink-0" />
            <span className="text-xs">{formatDate(order.createdAt!)}</span>
          </div>
        </div>
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">Progression des propositions</span>
            <span className="font-bold text-blue-600">
              {totalAccepted} / {order.quantiteTotal}{" "}
              {order.unite && UNITE_LABELS[order.unite]}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <Progress
              value={progress}
              className={"h-2.5 rounded-full"}
            />
          </div>
          <p className="text-xs text-gray-500">{progress.toFixed(0)}% de la demande couverte</p>
        </div>

        {/* Résumé des propositions */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle size={14} className="text-green-600" />
              <span className="text-xs text-gray-600">Acceptées</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{nbAcceptees}</span>
          </div>

          <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-1 mb-1">
              <Clock size={14} className="text-yellow-600" />
              <span className="text-xs whitespace-nowrap text-gray-600">En attente</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{nbEnAttente}</span>
          </div>

          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-1 mb-1">
              <ShoppingCart size={14} className="text-gray-600" />
              <span className="text-xs text-gray-600">Total</span>
            </div>
            <span className="text-2xl font-bold text-gray-700">{nbPropositions}</span>
          </div>
        </div>

        {/* Ma proposition (pour le paysan) */}
        {userRole === Role.PAYSAN && maPropre && (
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-900">Ma proposition</span>
              <Badge
                className={
                  maPropre.statutLigne === StatutCommandeLigne.ACCEPTEE
                    ? "bg-green-100 text-green-700"
                    : maPropre.statutLigne === StatutCommandeLigne.REJETEE
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }
              >
                {maPropre.statutLigne === StatutCommandeLigne.ACCEPTEE && "✅ Acceptée"}
                {maPropre.statutLigne === StatutCommandeLigne.REJETEE && "❌ Rejetée"}
                {maPropre.statutLigne === StatutCommandeLigne.EN_ATTENTE && "⏳ En attente"}
              </Badge>
            </div>
            <div className="text-sm text-purple-900">
              <span className="font-semibold">{maPropre.quantiteFournie} {order.unite && UNITE_LABELS[order.unite]}</span>
              {" • "}
              <span>{formatPrice(maPropre.prixUnitaire)} Ar/{order.unite && UNITE_LABELS[order.unite]}</span>
            </div>
          </div>
        )}

        {/* Message du collecteur */}
        {order.messageCollecteur && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <MessageSquare size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 line-clamp-2">
              {order.messageCollecteur}
            </p>
          </div>
        )}

        {/* Livraison */}
        {order.dateLivraisonPrevue && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck size={14} className="text-blue-600 shrink-0" />
            <span>
              Livraison souhaitée:{" "}
              <span className="font-semibold">{formatDate(order.dateLivraisonPrevue)}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderRequestCard;