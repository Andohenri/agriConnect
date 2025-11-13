import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Target } from "lucide-react";
import { toast } from "sonner";
import { Role, CommandeStatut, StatutCommandeLigne, Unite, ProductType } from "@/types/enums";
import { useNavigate } from "react-router-dom";
import OrderRequestCard from "@/components/composant/OrderRequestCard";
import DirectOrderCard from "@/components/composant/DirectOrderCard";
import { useOrder } from "@/contexts/OrderContext";

const Orders = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const navigate = useNavigate();
  const { setOrder } = useOrder();
  const [orders, setOrders] = useState<Order[]>([
    // Exemple de commande directe
    {
      id: "1",
      produitRecherche: null,
      quantiteTotal: "50",
      unite: Unite.KG as Unite,
      prixUnitaire: "12000",
      statut: CommandeStatut.EN_ATTENTE as CommandeStatut,
      messageCollecteur: "Livraison souhaitée avant le marché de samedi",
      adresseLivraison: "Lot II A 45 Bis, Fianarantsoa",
      dateLivraisonPrevue: "2025-11-20T08:00:00.000Z",
      createdAt: "2025-11-11T13:58:31.034Z",
      collecteurId: "1",
      collecteur: {
        nom: "Rakoto",
        prenom: "Jean",
        telephone: "034 12 345 67",
      },
      lignes: [
        {
          id: "1",
          produitId: "p1",
          produit: { nom: "Riz Premium", prixUnitaire: 2500, type: ProductType.GRAIN as ProductType, quantiteDisponible: 1000, dateRecolte: "2025-10-01", paysan: { nom: "Randria Paul", prenom: "Paul" } },
          quantiteFournie: "200",
          prixUnitaire: "2500",
          sousTotal: "500000",
          statutLigne: StatutCommandeLigne.EN_ATTENTE as StatutCommandeLigne,
        },
      ]
    },
    // Exemple de demande de commande
    {
      id: "2",
      produitRecherche: "Riz Premium Bio",
      quantiteTotal: "500",
      unite: Unite.KG as Unite,
      prixUnitaire: null,
      statut: CommandeStatut.OUVERTE as CommandeStatut,
      messageCollecteur: "Recherche de riz bio pour exportation",
      territoire: "Analamanga",
      latitude: -18.8792,
      longitude: 47.5079,
      rayon: 50,
      dateLivraisonPrevue: "2025-12-01T00:00:00.000Z",
      createdAt: "2025-11-10T10:00:00.000Z",
      collecteurId: "2",
      collecteur: {
        nom: "Rasoa",
        prenom: "Marie",
        telephone: "033 98 765 43",
      },
      lignes: [
        {
          id: "1",
          produitId: "p1",
          produit: { nom: "Riz Premium", prixUnitaire: 2500, type: ProductType.GRAIN as ProductType, quantiteDisponible: 1000, dateRecolte: "2025-10-01", paysan: { nom: "Randria Paul", prenom: "Paul" } },
          quantiteFournie: "200",
          prixUnitaire: "2500",
          sousTotal: "500000",
          statutLigne: StatutCommandeLigne.EN_ATTENTE as StatutCommandeLigne,
        },
        {
          id: "2",
          produitId: "p2",
          produit: { nom: "Riz Bio", prixUnitaire: 2800, type: ProductType.GRAIN as ProductType, quantiteDisponible: 800, dateRecolte: "2025-09-15", paysan: { nom: "Rabe Lala", prenom: "Lala" } },
          quantiteFournie: "150",
          prixUnitaire: "2800",
          sousTotal: "420000",
          statutLigne: StatutCommandeLigne.ACCEPTEE as StatutCommandeLigne,
        },
      ],
    },
  ]);

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
        </div>

        {/* Tabs pour séparer commandes directes et demandes */}
        <Tabs defaultValue="direct">
          <TabsList>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              Commandes Directes
              <Badge variant="secondary">{directOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Target size={16} />
              Demandes
              <Badge variant="secondary">{orderRequests.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Commandes Directes */}
          <TabsContent value="direct" className="space-y-4 mt-6 grid xl:grid-cols-3 3xl:grid-cols-4 gap-4">
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
          <TabsContent value="requests" className="space-y-4 mt-6 grid xl:grid-cols-3 3xl:grid-cols-4 gap-4">
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