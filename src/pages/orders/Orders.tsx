import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
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

const Orders = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const navigate = useNavigate();
  const { setOrder } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (userRole === Role.PAYSAN) {
        response = await OrderService.getAllOrdersPaysan();
      }
      else {
        response = await OrderService.getAllOrdersCollecteur(user?.id || "");
      }
      if (response?.data) {
        setOrders(response.data);
      } else {
        console.warn("Unexpected products response:", response);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };


  console.log(orders);
  



  // Séparer commandes directes et demandes
  const directOrders = orders.filter(
    (order) => !order.produitRecherche && !order.territoire
  );
  const orderRequests = orders.filter(
    (order) => order.produitRecherche && order.territoire
  );

  // Fonctions d'action
  const handleAcceptOrder = async (orderId: string) => {
    try {
      console.log("Accepter commande:", orderId);
      // await OrderService.acceptOrder(orderId);
      toast.success("Commande acceptée avec succès !");

      setOrders(orders.map(order => order.id === orderId
        ? ({ ...order, statut: CommandeStatut.ACCEPTEE } as Order)
        : order
      ));
    } catch (error) {
      toast.error("Erreur lors de l'acceptation de la commande");
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      console.log("Refuser commande:", orderId);
      // await OrderService.rejectOrder(orderId);
      toast.success("Commande refusée");

      setOrders(orders.map(order =>
        order.id === orderId
          ? ({ ...order, statut: CommandeStatut.ANNULEE } as Order)
          : order
      ));
    } catch (error) {
      toast.error("Erreur lors du refus de la commande");
    }
  };

  const handleAcceptOrderLine = async (orderId: string, lineId: string) => {
    try {
      console.log("Accepter ligne de commande:", lineId);
      // await OrderService.acceptOrderLine(orderId, lineId);
      toast.success("Proposition acceptée !");

      setOrders(orders.map(order => {
        if (order.id === orderId && order.lignes) {
          return {
            ...order,
            lignes: order.lignes.map(line =>
              line.id === lineId
                ? ({ ...line, statutLigne: StatutCommandeLigne.ACCEPTEE } as OrderLine)
                : line
            ),
          };
        }
        return order;
      }));
    } catch (error) {
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const handleRejectOrderLine = async (orderId: string, lineId: string) => {
    try {
      console.log("Rejeter ligne de commande:", lineId);
      // await OrderService.rejectOrderLine(orderId, lineId);
      toast.success("Proposition rejetée");

      setOrders(orders.map(order => {
        if (order.id === orderId && order.lignes) {
          return {
            ...order,
            lignes: order.lignes.map(line =>
              line.id === lineId
                ? ({ ...line, statutLigne: StatutCommandeLigne.REJETEE } as OrderLine)
                : line
            ),
          };
        }
        return order;
      }));
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
  };

  const handleContact = (userId: string) => {
    console.log("Contacter utilisateur:", userId);
    toast.info("Fonctionnalité de messagerie à venir");
  };

  const handlePayment = (orderId: string) => {
    console.log("Payer commande:", orderId);
    toast.info("Redirection vers le paiement...");
  };

  const handleViewDetails = (orderId: string) => {
    console.log("Voir détails:", orderId);
    setOrder(orders.find(order => order.id === orderId) || null);
    navigate(`/orders/${orderId}`);
  };

  const handleAPublishOrder = () => {
    navigate('/orders/ask');
  };

  return (
    <section>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {userRole === Role.PAYSAN ? "Commandes reçues" : "Mes Commandes"}
            </h1>
            <p className="text-gray-600 mt-1">
              {orders.length} commande(s) au total
            </p>
          </div>
          {user?.role === Role.COLLECTEUR && (
            <Button onClick={handleAPublishOrder} className="btn-primary flex items-center gap-2">
              <Plus size={24} />
              Publier une demande de commande
            </Button>
          )}
        </div>

        {/* Tabs pour séparer commandes directes et demandes */}
        <Tabs defaultValue="direct">
          <TabsList>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              <span className="hidden sm:block">Commandes Directes</span>
              <Tooltip text="Commandes directes reçues">
                <Badge variant="secondary">{directOrders.length}</Badge>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Target size={16} />
              <span className="hidden sm:block">Demandes</span>
              <Tooltip text="Demandes de matières premières reçues">
                <Badge variant="secondary">{orderRequests.length}</Badge>
              </Tooltip>
            </TabsTrigger>
          </TabsList>

          {/* Commandes Directes */}
          <TabsContent value="direct" className="space-y-4 mt-6 grid xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {directOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucune commande directe</p>
              </Card>
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
          <TabsContent value="requests" className="space-y-4 mt-6 grid xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {orderRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucune demande de commande</p>
              </Card>
            ) : (
              orderRequests.map((order) => (
                <OrderRequestCard
                  key={order.id}
                  order={order}
                  userRole={userRole}
                  onAcceptLine={handleAcceptOrderLine}
                  onRejectLine={handleRejectOrderLine}
                  onContact={handleContact}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Orders;