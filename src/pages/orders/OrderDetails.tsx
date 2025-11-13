// src/pages/orders/OrderDetails.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Check,
  DollarSign,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  X,
  Truck,
  User,
  Target,
  Mail,
  CheckCircle,
  Clock,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { Role, CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import { useNavigate } from "react-router-dom";
import { formatDate, formatPrice, formatQuantity, ORDER_STATUT_CONFIG, UNITE_LABELS } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const OrderDetails = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const { order, resetOrderState } = useOrder();
  const navigate = useNavigate();

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package size={64} className="text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Commande introuvable</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          Retour aux commandes
        </Button>
      </div>
    );
  }

  const isDirectOrder = !order.produitRecherche && !order.territoire;
  const isOrderRequest = order.produitRecherche && order.territoire;

  const statutConfig = ORDER_STATUT_CONFIG[order.statut || CommandeStatut.EN_ATTENTE];
  const StatusIcon = statutConfig.icon;

  // Actions handlers
  const handleAcceptOrder = () => {
    console.log('Accepter commande:', order.id);
    toast.success('Commande acceptée !');
  };

  const handleRejectOrder = () => {
    console.log('Refuser commande:', order.id);
    toast.success('Commande refusée');
  };

  const handleAcceptLine = (lineId: string) => {
    console.log('Accepter ligne:', lineId);
    toast.success('Proposition acceptée !');
  };

  const handleRejectLine = (lineId: string) => {
    console.log('Rejeter ligne:', lineId);
    toast.success('Proposition rejetée');
  };

  const handlePayment = () => {
    console.log('Paiement:', order.id);
    toast.info('Redirection vers le paiement...');
  };

  const handleContact = (userId: string) => {
    console.log('Contacter:', userId);
    toast.info('Messagerie à venir');
  };

  const handleBack = () => {
    resetOrderState();
    navigate('/orders');
  };

  const produit = order.lignes?.[0]?.produit;
  const totalOrder = Number(order.quantiteTotal) * Number(order.prixUnitaire);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold">
            {isDirectOrder ? 'Commande' : 'Demande'} #{order.id?.slice(0, 8)}
          </h2>
          <p className="text-gray-600 text-sm">
            Créée le {formatDate(order.createdAt!)}
          </p>
        </div>
        <Badge className={statutConfig.color} variant="outline">
          <StatusIcon size={16} className="mr-1" />
          {statutConfig.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* COMMANDE DIRECTE */}
          {isDirectOrder && (
            <>
              {/* Timeline de statut */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Suivi de la Commande</h3>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                      {/* Commande passée */}
                      <TimelineStep
                        icon={<CheckCircle />}
                        title="Commande passée"
                        date={formatDate(order.createdAt!)}
                        completed={true}
                      />

                      {/* Acceptée */}
                      <TimelineStep
                        icon={<Check />}
                        title="Commande acceptée"
                        date={order.statut !== CommandeStatut.EN_ATTENTE ? 'Confirmée' : 'En attente'}
                        completed={order.statut !== CommandeStatut.EN_ATTENTE}
                      />

                      {/* Payée */}
                      <TimelineStep
                        icon={<DollarSign />}
                        title="Paiement effectué"
                        date={order.statut === CommandeStatut.PAYE || order.statut === CommandeStatut.LIVREE ? 'Payé' : 'En attente'}
                        completed={order.statut === CommandeStatut.PAYE || order.statut === CommandeStatut.LIVREE}
                      />

                      {/* Livrée */}
                      <TimelineStep
                        icon={<Truck />}
                        title="Commande livrée"
                        date={order.dateLivraison ? formatDate(order.dateLivraison) : `Prévue le ${formatDate(order.dateLivraisonPrevue!)}`}
                        completed={order.statut === CommandeStatut.LIVREE}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détails du produit */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Détails du Produit</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-4xl shrink-0">
                      {produit?.imageUrl ? (
                        <img src={produit.imageUrl} alt={produit.nom} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        '📦'
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{produit?.nom || 'Produit'}</h4>
                      {produit?.sousType && (
                        <p className="text-sm text-gray-500">{produit.sousType}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Quantité</p>
                          <p className="font-semibold">
                            {formatQuantity(order.quantiteTotal!, order.unite)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prix unitaire</p>
                          <p className="font-semibold text-green-600">
                            {formatPrice(order.prixUnitaire!)} Ar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* DEMANDE DE COMMANDE */}
          {isOrderRequest && (
            <>
              {/* Informations de la demande */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Informations de la Demande</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-5xl">🎯</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{order.produitRecherche}</h4>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Quantité recherchée</p>
                          <p className="font-semibold">
                            {formatQuantity(order.quantiteTotal!, order.unite)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Zone</p>
                          <p className="font-semibold">{order.territoire}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Target className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Rayon</p>
                        <p className="font-semibold">{order.rayon} km</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Livraison souhaitée</p>
                        <p className="font-semibold">
                          {order.dateLivraisonPrevue ? formatDate(order.dateLivraisonPrevue) : 'À définir'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShoppingCart className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Propositions</p>
                        <p className="font-semibold">{order.lignes?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progression */}
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Progression de la Collecte</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const acceptedLines = order.lignes?.filter(l => l.statutLigne === StatutCommandeLigne.ACCEPTEE) || [];
                    const totalAccepted = acceptedLines.reduce((sum, line) => sum + Number(line.quantiteFournie), 0);
                    const progress = (totalAccepted / Number(order.quantiteTotal)) * 100;

                    return (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Quantité collectée</span>
                          <span className="font-bold text-blue-600">
                            {totalAccepted} / {order.quantiteTotal} {order.unite && UNITE_LABELS[order.unite]}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full">
                          <Progress
                            value={progress}
                            className={"h-2.5 rounded-full"}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{progress.toFixed(0)}% complété</p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Propositions reçues */}
              {order.lignes && order.lignes.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold">
                      Propositions Reçues ({order.lignes.length})
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.lignes.map((line) => (
                      <PropositionCard
                        key={line.id}
                        line={line}
                        userRole={userRole}
                        orderUnite={order.unite}
                        onAccept={handleAcceptLine}
                        onReject={handleRejectLine}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Informations de livraison */}
          {order.adresseLivraison && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Informations de Livraison</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-600 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-semibold">{order.adresseLivraison}</p>
                  </div>
                </div>
                {order.dateLivraisonPrevue && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-green-600 mt-1 shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Date prévue</p>
                      <p className="font-semibold">{formatDate(order.dateLivraisonPrevue)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <h4 className="font-bold text-lg">
                {userRole === Role.PAYSAN ? 'Collecteur' : 'Contact'}
              </h4>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-3xl shrink-0">
                  {userRole === Role.PAYSAN ? '🏢' : '👨‍🌾'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {order.collecteur?.nom} {order.collecteur?.prenom}
                  </p>
                  <p className="text-sm text-gray-500">
                    {userRole === Role.PAYSAN ? 'Collecteur' : 'Producteur'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {order.collecteur?.telephone && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = `tel:${order.collecteur?.telephone}`}
                  >
                    <Phone size={18} className="mr-2" />
                    {order.collecteur.telephone}
                  </Button>
                )}
                {order.collecteur?.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = `mailto:${order.collecteur?.email}`}
                  >
                    <Mail size={18} className="mr-2 shrink-0" />
                    <span className="truncate">{order.collecteur.email}</span>
                  </Button>
                )}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleContact(order.collecteurId)}
                >
                  <MessageSquare size={18} className="mr-2" />
                  Envoyer un message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message du collecteur */}
          {order.messageCollecteur && (
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <MessageSquare className="text-blue-600" size={20} />
                  Message du collecteur
                </h4>
                <p className="text-gray-700">{order.messageCollecteur}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions selon rôle et statut */}
          {userRole === Role.PAYSAN && order.statut === CommandeStatut.EN_ATTENTE && isDirectOrder && (
            <Card>
              <CardHeader>
                <h4 className="font-bold text-lg">Actions</h4>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  onClick={handleAcceptOrder}
                >
                  <Check size={20} className="mr-2" />
                  Accepter la commande
                </Button>
                <Button
                  variant="destructive"
                  className="w-full h-12"
                  onClick={handleRejectOrder}
                >
                  <X size={20} className="mr-2" />
                  Refuser
                </Button>
              </CardContent>
            </Card>
          )}

          {userRole === Role.COLLECTEUR && order.statut === CommandeStatut.ACCEPTEE && !isOrderRequest && (
            <Card>
              <CardHeader>
                <h4 className="font-bold text-lg">Paiement</h4>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  onClick={handlePayment}
                >
                  <DollarSign size={20} className="mr-2" />
                  Effectuer le paiement
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Résumé financier (Commande directe uniquement) */}
          {isDirectOrder && (
            <Card className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200">
              <CardHeader>
                <h4 className="font-bold">Résumé Financier</h4>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-semibold">{formatPrice(totalOrder)} Ar</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between pt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-green-600 text-xl">
                      {formatPrice(totalOrder)} Ar
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

// ============================================
// COMPOSANT: TIMELINE STEP
// ============================================
interface TimelineStepProps {
  icon: React.ReactNode;
  title: string;
  date: string;
  completed: boolean;
}

const TimelineStep = ({ icon, title, date, completed }: TimelineStepProps) => {
  return (
    <div className="relative flex gap-4">
      <div
        className={`w-8 h-8 ${completed ? 'bg-green-500' : 'bg-gray-300'
          } rounded-full flex items-center justify-center text-white font-bold z-10 shrink-0`}
      >
        {completed ? icon : <Clock size={16} />}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT: PROPOSITION CARD
// ============================================
interface PropositionCardProps {
  line: OrderLine;
  userRole?: Role;
  orderUnite?: Unite;
  onAccept: (lineId: string) => void;
  onReject: (lineId: string) => void;
}

const PropositionCard = ({ line, userRole, orderUnite, onAccept, onReject }: PropositionCardProps) => {
  const isPending = line.statutLigne === StatutCommandeLigne.EN_ATTENTE;
  const isAccepted = line.statutLigne === StatutCommandeLigne.ACCEPTEE;
  const isRejected = line.statutLigne === StatutCommandeLigne.REJETEE;

  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="font-semibold">{line.produit?.nom}</h5>
              <Badge
                className={
                  isAccepted
                    ? 'bg-green-100 text-green-700'
                    : isRejected
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }
              >
                {isAccepted && '✅ Acceptée'}
                {isRejected && '❌ Rejetée'}
                {isPending && '⏳ En attente'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span>Paysan: {line.produit?.paysan?.nom || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={14} className="text-gray-400" />
                <span className="font-semibold">
                  {line.quantiteFournie} {orderUnite && UNITE_LABELS[orderUnite]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-gray-400" />
                <span>
                  {formatPrice(line.prixUnitaire)} Ar/{orderUnite && UNITE_LABELS[orderUnite]}
                </span>
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
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onAccept(line.id!)}
              >
                <Check size={16} className="mr-1" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(line.id!)}
              >
                <X size={16} className="mr-1" />
                Rejeter
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetails;