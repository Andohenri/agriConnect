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
import { Link, useNavigate } from "react-router-dom";
import { formatDate, formatPrice, formatQuantity, getPriceIndicator, ORDER_STATUT_CONFIG, UNITE_LABELS } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { OrderService } from "@/service/order.service";

const OrderDetails = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const { order, resetOrderState, setOrder } = useOrder();
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

  const isDirectOrder = !order.territoire;
  const isOrderRequest = order.produitRecherche && order.territoire;

  const statutConfig = ORDER_STATUT_CONFIG[order.statut || CommandeStatut.EN_ATTENTE];
  const StatusIcon = statutConfig.icon;

  // Actions handlers
  const handleAcceptOrder = async () => {
    console.log('Accepter commande:', order.id);
    await OrderService.acceptOrder(order.id!);
    setOrder({ ...order, statut: CommandeStatut.ACCEPTEE as CommandeStatut });
    toast.success('Commande acceptée !');
  };

  const handleRejectOrder = async () => {
    console.log('Refuser commande:', order.id);
    await OrderService.rejectOrder(order.id!);
    setOrder({ ...order, statut: CommandeStatut.ANNULEE as CommandeStatut });
    toast.success('Commande refusée');
  };

  const handleAcceptLine = async (lineId: string) => {
    console.log('Accepter ligne:', lineId);
    await OrderService.acceptProposal(lineId);
    const updatedLignes = order.lignes?.map(l =>
      l.id === lineId ? ({ ...l, statutLigne: StatutCommandeLigne.ACCEPTEE } as OrderLine) : l
    );
    setOrder({ ...order, lignes: updatedLignes });
    toast.success('Proposition acceptée !');
  };

  const handleRejectLine = async (lineId: string) => {
    console.log('Rejeter ligne:', lineId);
    await OrderService.rejectProposal(lineId);
    const updatedLignes = order.lignes?.map(l =>
      l.id === lineId ? ({ ...l, statutLigne: StatutCommandeLigne.REJETEE } as OrderLine) : l
    );
    setOrder({ ...order, lignes: updatedLignes });
    toast.success('Proposition rejetée');
  };

  const handlePayment = async () => {
    console.log('Paiement:', order.id);
    await OrderService.payOrder(order.id!);
    setOrder({ ...order, statut: CommandeStatut.PAYEE as CommandeStatut });
    toast.info('Fonctionnalité de paiement à venir');
  };

  const handleDelivery = async () => {
    console.log('Livraison:', order.id);
    await OrderService.deliverOrder(order.id!);
    setOrder({ ...order, statut: CommandeStatut.LIVREE as CommandeStatut });
    toast.success('Commande marquée comme livrée');
  }

  const handleProposeOffer = (orderId: string) => {
    console.log('Proposer une offre pour la demande:', orderId);
    toast.info('Fonctionnalité de proposition d\'offre à venir');
  };

  const handleContact = (userId: string) => {
    console.log('Contacter:', userId);
    toast.info('Messagerie à venir');
  };

  const handleBack = () => {
    navigate(-1);
    resetOrderState();
  };

  const produit = order.lignes?.[0]?.produit;
  const totalOrder = Number(order.quantiteTotal) * Number(order.prixUnitaire);

  const prixOriginal = produit?.prixUnitaire || 0;
  const prixPropose = order.prixUnitaire || 0;
  const difference = (prixPropose as number) - prixOriginal;
  const pourcentage = prixOriginal > 0
    ? ((difference / prixOriginal) * 100).toFixed(1)
    : 0;
  const indicator = getPriceIndicator(difference);

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

                      {/* Acceptée ou refusée */}
                      {order.statut === CommandeStatut.ACCEPTEE || order.statut === CommandeStatut.PAYEE || order.statut === CommandeStatut.LIVREE ? (
                        <TimelineStep
                          icon={<Check />}
                          title="Commande acceptée"
                          date="Confirmée"
                          completed={true}
                        />
                      ) : order.statut === CommandeStatut.ANNULEE ? (
                        <TimelineStep
                          icon={<X />}
                          title="Commande refusée"
                          date="Refusée"
                          completed={true}
                        />
                      ) : (
                        <TimelineStep
                          icon={<Check />}
                          title="Commande en attente"
                          date="En attente de validation"
                          completed={false}
                        />
                      )}

                      {/* Payée */}
                      <TimelineStep
                        icon={<DollarSign />}
                        title="Paiement effectué"
                        date={order.statut === CommandeStatut.PAYEE || order.statut === CommandeStatut.LIVREE ? 'Payé' : 'En attente'}
                        completed={order.statut === CommandeStatut.PAYEE || order.statut === CommandeStatut.LIVREE}
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
              <Card className="gap-2">
                <CardHeader>
                  <h3 className="text-xl font-bold">Détails du Produit</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-4xl shrink-0">
                      {produit?.imageUrl ? (
                        <img src={`${import.meta.env.VITE_UPLOAD_URL}${produit.imageUrl}`} alt={produit.nom} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        '📦'
                      )}
                    </div>

                    {/* Info produit */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xl text-gray-900 mb-1 truncate">
                        {produit?.nom || 'Produit'}
                      </h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        {produit?.type && (
                          <Badge variant="secondary" className="text-xs">
                            {produit.type.toUpperCase()}
                          </Badge>
                        )}
                        {produit?.sousType && (
                          <Badge variant="outline" className="text-xs">
                            {produit.sousType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>

                  {/* Informations de commande */}
                  <div className="space-y-4">
                    {/* Grid Quantité et Prix original */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Quantité */}
                      <Card className="bg-gray-50 py-4! border-gray-200">
                        <CardContent>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Quantité
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatQuantity(order.quantiteTotal!, order.unite!)}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Prix Original */}
                      <Card className="bg-gray-50 py-4! border-gray-200">
                        <CardContent>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Prix original
                          </p>
                          <p className={`text-lg font-bold ${difference !== 0 ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {formatPrice(prixOriginal)} Ar
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Prix proposé avec indicateur */}
                    <Card className={`border-2 ${indicator.borderColor} ${indicator.bgColor}`}>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                              Prix proposé
                            </p>
                            <p className={`text-2xl font-bold ${indicator.color}`}>
                              {formatPrice(prixPropose)} Ar
                            </p>
                          </div>

                          {difference !== 0 && (
                            <div className={`flex flex-col items-end ${indicator.color}`}>
                              <div className="flex items-center gap-1">
                                <indicator.icon className="w-5 h-5" />
                                <span className="text-lg font-bold">
                                  {Math.abs(Number(pourcentage))}%
                                </span>
                              </div>
                              <span className="text-sm font-medium mt-0.5">
                                {difference > 0 ? '+' : ''}{formatPrice(Math.abs(difference))} Ar
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Message explicatif */}
                        {difference !== 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className={`text-xs font-medium text-center ${indicator.color}`}>
                              {difference > 0
                                ? `Prix ${pourcentage}% plus élevé que le catalogue`
                                : `Économie de ${Math.abs(Number(pourcentage))}% par rapport au catalogue`
                              }
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
                    const totalAccepted = acceptedLines.reduce((sum, line) => sum + Number(line.quantiteAccordee || 0), 0);
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
                {order.dateLivraison && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-green-600 mt-1 shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Livrée le</p>
                      <p className="font-semibold">{formatDate(order.dateLivraison)}</p>
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
                  <Link to={`/profile/${order.collecteur?.id}`}>
                    {order.collecteur?.imageUrl ? (
                      <img src={`${import.meta.env.VITE_UPLOAD_URL}${order.collecteur?.imageUrl}`} alt="avatar" />
                    ) : '👨‍🌾'}
                  </Link>
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
                  onClick={() => handleContact(order.collecteur?.id!)}
                >
                  <MessageSquare size={18} className="mr-2" />
                  Envoyer un message
                </Button>
              </div>
            </CardContent>
          </Card>

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

          {userRole === Role.PAYSAN && order.statut === CommandeStatut.PAYEE && !isOrderRequest && (
            <Card>
              <CardHeader>
                <h4 className="font-bold text-lg">Livraison</h4>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  onClick={handleDelivery}
                >
                  <Truck size={20} className="mr-2" />
                  Marquer comme livrée
                </Button>
              </CardContent>
            </Card>
          )}

          {userRole === Role.PAYSAN && order.statut === CommandeStatut.OUVERTE && isOrderRequest && (
            <Card>
              <CardHeader>
                <h4 className="font-bold text-lg">Proposer une Offre</h4>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                  onClick={() => handleProposeOffer(order.id!)}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Proposer une offre
                </Button>
              </CardContent>
            </Card>
          )}

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

  const sousTotal = Number(line.quantiteAccordee) * Number(line.prixUnitaire);

  return (
    <Card key={line.id} className="bg-gray-50">
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
                  {line.quantiteAccordee} {orderUnite && UNITE_LABELS[orderUnite]}
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
                  Sous-total: {formatPrice(sousTotal)} Ar
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