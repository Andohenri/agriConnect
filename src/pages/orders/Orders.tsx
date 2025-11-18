import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ShoppingCart, Target } from "lucide-react";
import { toast } from "sonner";
import { Role, CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import { useNavigate } from "react-router-dom";
import OrderRequestCard from "@/components/composant/OrderRequestCard";
import DirectOrderCard from "@/components/composant/DirectOrderCard";
import { useOrder } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { OrderService } from "@/service/order.service";
import Tooltip from "../../components/composant/Tooltip";
import { convertDataToCommandeFormattedList } from "@/lib/utils";
import { EmptyState } from "@/components/composant/EmptyState";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProposalModal } from "@/components/composant/ProposalModal";
import { ProductService } from "@/service/product.service";

const Orders = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const navigate = useNavigate();
  const { setOrder } = useOrder();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [paysanProducts, setPaysanProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchPaysanProducts = async () => {
    try {
      const response = await ProductService.getAllProductsPaysan(1, 100);
      setPaysanProducts(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits du paysan:", error);
    }
  };

  useEffect(() => {
    if (userRole === Role.PAYSAN) {
      fetchPaysanProducts();
    }
  }, [userRole]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (userRole === Role.PAYSAN) {
        const [orderRequests, directOrders] = await Promise.all([
          OrderService.getAllOrdersRequestPaysan(),
          OrderService.getAllOrdersDirectPaysan(),
        ]);
        
        setOrders([
          ...orderRequests.data,
          ...convertDataToCommandeFormattedList(directOrders.data),
        ]);
      } else {
        response = await OrderService.getAllOrdersCollecteur(user?.id || "");
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Séparer commandes directes et demandes
  const directOrders = orders.filter((order) => !order.territoire);
  const orderRequests = orders.filter(
    (order) => order.produitRecherche && order.territoire
  );
  

  // Fonctions d'action
  const handleAcceptOrder = async (orderId: string) => {
    try {
      console.log("Accepter commande:", orderId);
      await OrderService.acceptOrder(orderId);
      toast.success("Commande acceptée avec succès !");

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? ({ ...order, statut: CommandeStatut.ACCEPTEE } as Order)
            : order
        )
      );
    } catch (error) {
      toast.error("Erreur lors de l'acceptation de la commande");
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      console.log("Refuser commande:", orderId);
      await OrderService.rejectOrder(orderId);
      toast.success("Commande refusée");

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? ({ ...order, statut: CommandeStatut.ANNULEE } as Order)
            : order
        )
      );
    } catch (error) {
      toast.error("Erreur lors du refus de la commande");
    }
  };

  const handleAcceptOrderLine = async (orderId: string, lineId: string) => {
    try {
      console.log("Accepter ligne de commande:", lineId);
      // await OrderService.acceptOrderLine(orderId, lineId);
      toast.success("Proposition acceptée !");

      setOrders(
        orders.map((order) => {
          if (order.id === orderId && order.lignes) {
            return {
              ...order,
              lignes: order.lignes.map((line) =>
                line.id === lineId
                  ? ({
                    ...line,
                    statutLigne: StatutCommandeLigne.ACCEPTEE,
                  } as OrderLine)
                  : line
              ),
            };
          }
          return order;
        })
      );
    } catch (error) {
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const handleRejectOrderLine = async (orderId: string, lineId: string) => {
    try {
      console.log("Rejeter ligne de commande:", lineId);
      // await OrderService.rejectOrderLine(orderId, lineId);
      toast.success("Proposition rejetée");

      setOrders(
        orders.map((order) => {
          if (order.id === orderId && order.lignes) {
            return {
              ...order,
              lignes: order.lignes.map((line) =>
                line.id === lineId
                  ? ({
                    ...line,
                    statutLigne: StatutCommandeLigne.REJETEE,
                  } as OrderLine)
                  : line
              ),
            };
          }
          return order;
        })
      );
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
  };

  const handleProposeOffer = (orderId: string) => {
    setShowProposalModal(true);
    console.log("Proposer une offre pour la demande:", orderId);
    toast.info("Fonctionnalité de proposition d'offre à venir");
  }

  const handleContact = (userId: string) => {
    console.log("Contacter utilisateur:", userId);
    toast.info("Fonctionnalité de messagerie à venir");
  };

  const handlePayment = async (orderId: string) => {
    console.log("Payer commande:", orderId);
    await OrderService.payOrder(orderId);
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? ({ ...order, statut: CommandeStatut.PAYEE } as Order)
          : order
      )
    );
    toast.info("Fonctionnalité de paiement à venir");
  };

  const handleViewDetails = (orderId: string) => {
    console.log("Voir détails:", orderId);
    setOrder(orders.find((order) => order.id === orderId) || null);
    navigate(`/orders/${orderId}`);
  };

  const handleAPublishOrder = () => {
    navigate("/orders/ask");
  };

  return (
    <section>
      <div className="space-y-6">
        {/* Tabs pour séparer commandes directes et demandes */}
        <Tabs defaultValue="direct">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-lg md:text-3xl font-bold">
                {userRole === Role.PAYSAN
                  ? "Commandes reçues"
                  : "Mes Commandes"}
              </h1>
              <p className="text-gray-600 text-[13px] mt-1">
                {orders.length} commande(s) au total
              </p>
            </div>
            <div className="flex items-center gap-5">
              <TabsList>
                <TabsTrigger value="direct" className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  <span className="hidden sm:block">Commandes Directes</span>
                  <Tooltip text="Commandes directes reçues">
                    <Badge variant="secondary">{directOrders.length}</Badge>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="flex items-center gap-2"
                >
                  <Target size={16} />
                  <span className="hidden sm:block">Demandes</span>
                  <Tooltip text="Demandes de matières premières reçues">
                    <Badge variant="secondary">{orderRequests.length}</Badge>
                  </Tooltip>
                </TabsTrigger>
              </TabsList>
              {user?.role === Role.COLLECTEUR && (
                <Button
                  onClick={handleAPublishOrder}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={24} />
                  Publier une demande
                </Button>
              )}
            </div>
          </div>

          {/* Commandes Directes */}
          <TabsContent
            value="direct"
            className="space-y-4 mt-6 grid xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <OrderCardSkeleton key={i} />
              ))
            ) : directOrders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <EmptyState
                  title="Aucune commande reçue"
                  description="Vous n’avez pas encore de commande. Elles apparaîtront ici dès qu’il y en aura."
                  media={<ShoppingCart />}
                />
              </div>
            ) : (
              directOrders.map((order) => (
                <DirectOrderCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onAccept={handleAcceptOrder}
                  onReject={handleRejectOrder}
                  onContact={handleContact}
                  onPayment={handlePayment}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </TabsContent>

          {/* Demandes de Commande */}
          <TabsContent
            value="requests"
            className="space-y-4 mt-6 grid xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <OrderCardSkeleton key={i} />
              ))
            ) : orderRequests.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <EmptyState
                  title="Aucune Demande envoyée"
                  description="Vous n’avez pas encore de demande. Elles apparaîtront ici dès qu’il y en aura."
                  media={<Target />}
                />
              </div>
            ) : (
              orderRequests.map((order) => (
                <>
                  <OrderRequestCard
                    key={order.id}
                    order={order}
                    userRole={userRole}
                    onAcceptLine={handleAcceptOrderLine}
                    onRejectLine={handleRejectOrderLine}
                    onContact={handleContact}
                    onViewDetails={handleViewDetails}
                    onProposeOffer={handleProposeOffer}
                  />

                  <ProposalModal
                    isOpen={showProposalModal}
                    onClose={() => setShowProposalModal(false)}
                    order={order}
                    availableProducts={paysanProducts}
                  />
                </>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Orders;


const OrderCardSkeleton = () => {
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
