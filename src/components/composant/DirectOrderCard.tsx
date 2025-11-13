import { formatDate, formatPrice, formatQuantity, ORDER_STATUT_CONFIG } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Calendar,
  Check,
  DollarSign,
  Eye,
  MapPin,
  MessageSquare,
  MoreVertical,
  Package,
  Truck,
  User,
  X,
} from "lucide-react";
import { Role, CommandeStatut } from "@/types/enums";

interface DirectOrderCardProps {
  order: Order;
  userRole?: Role;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onContact: (userId: string) => void;
  onPayment: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
}

const DirectOrderCard = ({
  order,
  userRole,
  onAccept,
  onReject,
  onContact,
  onPayment,
  onViewDetails,
}: DirectOrderCardProps) => {
  const statutConfig = ORDER_STATUT_CONFIG[order.statut || CommandeStatut.EN_ATTENTE];
  const StatusIcon = statutConfig.icon;
  const isPending = order.statut === CommandeStatut.EN_ATTENTE;
  const isAccepted = order.statut === CommandeStatut.ACCEPTEE;
  const isPaid = order.statut === CommandeStatut.PAYE;
  const isDelivered = order.statut === CommandeStatut.LIVREE;

  // Récupérer le produit de la première ligne
  const produit = order.lignes?.[0]?.produit;
  const total = Number(order.quantiteTotal) * Number(order.prixUnitaire);

  return (
    <Card className="hover:shadow-md gap-0! transition-all duration-300 cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {/* Informations principales */}
          <div className="flex items-start gap-4 flex-1">
            {/* Image ou icône du produit */}
            <div className="w-16 h-16 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-4xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              {produit?.imageUrl ? (
                <img
                  src={produit.imageUrl}
                  alt={produit.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>📦</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Titre */}
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold line-clamp-1">
                    {produit?.nom || `Commande #${order.id?.slice(0, 8)}`}
                  </h3>
                  {produit?.sousType && (
                    <p className="text-xs text-gray-500">{produit.sousType}</p>
                  )}
                </div>
              </div>
              <Badge className={statutConfig.color}>
                <StatusIcon size={12} className="mr-1" />
                {statutConfig.label}
              </Badge>
            </div>
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
                  Voir les détails
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Actions pour le PAYSAN */}
                {userRole === Role.PAYSAN && (
                  <>
                    {isPending && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onAccept(order.id!)}
                          className="text-green-600 focus:text-green-600 focus:bg-green-50"
                        >
                          <Check size={16} className="mr-2" />
                          Accepter la commande
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onReject(order.id!)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <X size={16} className="mr-2" />
                          Refuser la commande
                        </DropdownMenuItem>
                      </>
                    )}

                    {(isAccepted || isPaid || isDelivered) && (
                      <DropdownMenuItem onClick={() => onContact(order.collecteurId)}>
                        <MessageSquare size={16} className="mr-2" />
                        Contacter le collecteur
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {/* Actions pour le COLLECTEUR */}
                {userRole === Role.COLLECTEUR && (
                  <>
                    {isAccepted && !isPaid && (
                      <DropdownMenuItem
                        onClick={() => onPayment(order.id!)}
                        className="text-green-600 focus:text-green-600 focus:bg-green-50"
                      >
                        <DollarSign size={16} className="mr-2" />
                        Procéder au paiement
                      </DropdownMenuItem>
                    )}

                    {(isAccepted || isPaid || isDelivered) && produit?.paysan?.id && (
                      <DropdownMenuItem onClick={() => onContact(produit?.paysan?.id!)}>
                        <MessageSquare size={16} className="mr-2" />
                        Contacter le paysan
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menu Actions */}

        </div>
      </CardHeader>

      <CardContent
        className="space-y-3"
        onClick={() => onViewDetails(order.id!)}
      >
        {/* Informations utilisateur */}
        <div className="space-y-1.5 text-sm">
          {userRole === Role.PAYSAN ? (
            // Vue Paysan: Afficher le collecteur
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} className="text-blue-600 shrink-0" />
              <span className="font-medium">
                {order.collecteur?.nom} {order.collecteur?.prenom}
              </span>
            </div>
          ) : (
            // Vue Collecteur: Afficher le paysan
            produit?.paysan && (
              <div className="flex items-center gap-2 text-gray-600">
                <User size={14} className="text-green-600 shrink-0" />
                <span className="font-medium">
                  {produit.paysan.nom} {produit.paysan.prenom}
                </span>
              </div>
            )
          )}

          {/* Quantité et prix */}
          <div className="flex items-center gap-2">
            <Package size={14} className="text-green-600 shrink-0" />
            <span className="font-semibold text-gray-700">
              {formatQuantity(order.quantiteTotal!, order.unite)}
            </span>
            <span className="text-gray-400">×</span>
            <span className="text-gray-600">
              {formatPrice(order.prixUnitaire!)} Ar ({formatPrice(produit?.prixUnitaire!)} Ar unité)
            </span>
          </div>

          {/* Date de commande */}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={14} className="shrink-0" />
            <span className="text-xs">{formatDate(order.createdAt!)}</span>
          </div>
        </div>
        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-linear-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <span className="text-sm font-medium text-gray-700">Total de la commande</span>
          <span className="text-xl font-bold text-green-600">
            {formatPrice(total)} Ar
          </span>
        </div>

        {/* Informations de livraison */}
        <div className="space-y-2">
          {order.dateLivraisonPrevue && (
            <div className="flex items-center gap-2 text-sm">
              <Truck size={14} className="text-blue-600 shrink-0" />
              <span className="text-gray-600">
                Livraison prévue:{" "}
                <span className="font-semibold text-gray-800">
                  {formatDate(order.dateLivraisonPrevue)}
                </span>
              </span>
            </div>
          )}

          {order.adresseLivraison && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <span className="text-gray-600 line-clamp-2">{order.adresseLivraison}</span>
            </div>
          )}
        </div>

        {/* Message du collecteur */}
        {order.messageCollecteur && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <MessageSquare size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 line-clamp-2">
              {order.messageCollecteur}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectOrderCard;