import { formatPrice, LINE_STATUT_CONFIG } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertCircle, Check, CheckCircle, DollarSign, Package, TrendingUp, User, X } from "lucide-react";
import { Button } from "../ui/button";
import { Role, StatutCommandeLigne } from "@/types/enums";

interface OrderLineCardProps {
  line: OrderLine;
  orderId: string;
  userRole?: Role;
  onAccept: (orderId: string, lineId: string) => void;
  onReject: (orderId: string, lineId: string) => void;
}

const OrderLineCard = ({
  line,
  orderId,
  userRole,
  onAccept,
  onReject,
}: OrderLineCardProps) => {
  const lineConfig = LINE_STATUT_CONFIG[line.statutLigne || StatutCommandeLigne.EN_ATTENTE];
  const isPending = line.statutLigne === StatutCommandeLigne.EN_ATTENTE;

  return (
    <Card className="bg-gray-50 border border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="font-semibold">{line.produit?.nom}</h5>
              <Badge className={lineConfig.color}>
                {lineConfig.label}
              </Badge>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span>Paysan: {line.produit?.paysan?.nom || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={14} className="text-gray-400" />
                <span>Quantité: {line.quantiteFournie} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-gray-400" />
                <span>Prix: {formatPrice(line.prixUnitaire)} Ar/kg</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-600" />
                <span className="font-semibold text-green-600">
                  Sous-total: {formatPrice(line.sousTotal!)} Ar
                </span>
              </div>
            </div>
          </div>

          {/* Actions pour le collecteur */}
          {userRole === Role.COLLECTEUR && isPending && (
            <div className="flex flex-col gap-2 sm:w-auto w-full">
              <Button
                onClick={() => onAccept(orderId, line.id!)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check size={16} className="mr-1" />
                Accepter
              </Button>
              <Button
                onClick={() => onReject(orderId, line.id!)}
                size="sm"
                variant="destructive"
              >
                <X size={16} className="mr-1" />
                Rejeter
              </Button>
            </div>
          )}

          {/* Statut pour le paysan */}
          {userRole === Role.PAYSAN && !isPending && (
            <div className="flex items-center justify-center">
              {line.statutLigne === StatutCommandeLigne.ACCEPTEE ? (
                <CheckCircle size={24} className="text-green-600" />
              ) : (
                <AlertCircle size={24} className="text-red-600" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderLineCard;