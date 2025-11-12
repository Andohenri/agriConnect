/* eslint-disable react-hooks/exhaustive-deps */
import { Calendar, Check, DollarSign, MessageSquare, Plus, X, Package, Search, Filter, MapPin, Clock, User, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/contexts/OrderContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Types de statuts de commande
enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  IN_PROGRESS = "in_progress",
  DELIVERED = "delivered",
  COMPLETED = "completed",
}

// Type pour les demandes de produit
interface ProductRequest {
  id: string;
  produitRecherche: string;
  quantiteTotal: number;
  unite: string;
  prixUnitaire?: number;
  messageCollecteur?: string;
  territoire: string;
  rayon: number;
  latitude: number;
  longitude: number;
  collecteur: {
    id: string;
    nom: string;
    prenom: string;
  };
  dateLivraisonPrevue?: string;
  createdAt: string;
  statut: string;
  responsesCount?: number;
}

const Orders = () => {
  const navigate = useNavigate();
  const { setIsEditing, setIsAdding, setOrder } = useOrder();
  const { user } = useAuth();
  const userRole = user?.role;

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Données de démonstration
  const orders = [
    {
      id: "1",
      product: "Riz Premium",
      quantity: 100,
      unite: "kg",
      status: OrderStatus.PENDING,
      buyer: "Société AgriTrade",
      buyerId: "buyer1",
      seller: "Jean Rakoto",
      sellerId: "seller1",
      price: 250000,
      date: "2025-01-10",
      deliveryDate: "2025-01-15",
      location: "Antananarivo",
    },
    {
      id: "2",
      product: "Maïs Bio",
      quantity: 50,
      unite: "kg",
      status: OrderStatus.ACCEPTED,
      buyer: "CoopéGrain",
      buyerId: "buyer2",
      seller: "Marie Rasoa",
      sellerId: "seller2",
      price: 90000,
      date: "2025-01-08",
      deliveryDate: "2025-01-12",
      location: "Antsirabe",
    },
    {
      id: "3",
      product: "Haricots Secs",
      quantity: 200,
      unite: "kg",
      status: OrderStatus.DELIVERED,
      buyer: "Distribution Pro",
      buyerId: "buyer3",
      seller: "Paul Randria",
      sellerId: "seller3",
      price: 640000,
      date: "2025-01-05",
      deliveryDate: "2025-01-10",
      location: "Fianarantsoa",
    },
  ];

  const productRequests: ProductRequest[] = [
    {
      id: "req1",
      produitRecherche: "Riz Blanc",
      quantiteTotal: 500,
      unite: "kg",
      prixUnitaire: 2500,
      messageCollecteur: "Recherche riz de qualité premium pour export",
      territoire: "Antananarivo",
      rayon: 25,
      latitude: -18.8792,
      longitude: 47.5079,
      collecteur: {
        id: "coll1",
        nom: "Rakoto",
        prenom: "Jean",
      },
      dateLivraisonPrevue: "2025-01-20",
      createdAt: "2025-01-10",
      statut: "active",
      responsesCount: 3,
    },
    {
      id: "req2",
      produitRecherche: "Maïs Bio",
      quantiteTotal: 300,
      unite: "kg",
      prixUnitaire: 1800,
      messageCollecteur: "Besoin urgent de maïs bio certifié",
      territoire: "Antsirabe",
      rayon: 15,
      latitude: -19.86,
      longitude: 47.03,
      collecteur: {
        id: "coll2",
        nom: "Rasoa",
        prenom: "Marie",
      },
      dateLivraisonPrevue: "2025-01-18",
      createdAt: "2025-01-09",
      statut: "active",
      responsesCount: 1,
    },
  ];

  const handlePublishOrder = () => {
    setOrder(null);
    setIsAdding(true);
    setIsEditing(false);
    navigate('/orders/ask');
  };

  const handleAcceptOrder = (orderId: string) => {
    toast.success("Commande acceptée avec succès");
    // API call here
  };

  const handleRejectOrder = (orderId: string) => {
    toast.error("Commande refusée");
    // API call here
  };

  const handleRespondToRequest = (requestId: string) => {
    navigate(`/orders/requests/${requestId}/respond`);
  };

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.PENDING]: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-700",
        icon: <Clock size={16} />,
      },
      [OrderStatus.ACCEPTED]: {
        label: "Acceptée",
        color: "bg-blue-100 text-blue-700",
        icon: <CheckCircle size={16} />,
      },
      [OrderStatus.REJECTED]: {
        label: "Refusée",
        color: "bg-red-100 text-red-700",
        icon: <X size={16} />,
      },
      [OrderStatus.IN_PROGRESS]: {
        label: "En cours",
        color: "bg-purple-100 text-purple-700",
        icon: <TrendingUp size={16} />,
      },
      [OrderStatus.DELIVERED]: {
        label: "Livrée",
        color: "bg-green-100 text-green-700",
        icon: <Check size={16} />,
      },
      [OrderStatus.COMPLETED]: {
        label: "Terminée",
        color: "bg-gray-100 text-gray-700",
        icon: <CheckCircle size={16} />,
      },
    };
    return configs[status];
  };

  // Statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
    accepted: orders.filter((o) => o.status === OrderStatus.ACCEPTED).length,
    delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED).length,
  };

  const requestStats = {
    total: productRequests.length,
    active: productRequests.filter((r) => r.statut === "active").length,
    responses: productRequests.reduce((acc, r) => acc + (r.responsesCount || 0), 0),
  };

  return (
    <section className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {userRole === Role.ADMIN ? "Gestion des Commandes" :
               userRole === Role.PAYSAN ? "Commandes & Demandes" :
               "Mes Commandes"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {userRole === Role.ADMIN ? "Vue d'ensemble de toutes les transactions" :
               userRole === Role.PAYSAN ? "Gérez vos commandes et répondez aux demandes" :
               "Suivez vos commandes et demandes de produits"}
            </p>
          </div>

          {userRole === Role.COLLECTEUR && (
            <Button
              onClick={handlePublishOrder}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Demander un produit
            </Button>
          )}
        </div>

        {/* Statistiques Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">En attente</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Acceptées</p>
                <p className="text-xl font-bold">{stats.accepted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Livrées</p>
                <p className="text-xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Rechercher une commande ou un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="delivered">Livrées</option>
          </select>
        </div>
      </div>

      {/* Tabs pour séparer Commandes et Demandes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package size={16} />
            Commandes ({stats.total})
          </TabsTrigger>
          {(userRole === Role.PAYSAN || userRole === Role.COLLECTEUR || userRole === Role.ADMIN) && (
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Demandes ({requestStats.total})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab Commandes */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune commande disponible</p>
            </Card>
          ) : (
            orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const isUserBuyer = user?.id === order.buyerId;
              const isUserSeller = user?.id === order.sellerId;

              return (
                <Link to={`/orders/${order.id}`} key={order.id}>
                  <Card className="p-6 hover:shadow-xl transition group">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* Informations principales */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition">
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xl font-bold group-hover:text-green-600 transition">
                              {order.product}
                            </h3>
                            <Badge className={`${statusConfig.color} flex items-center gap-1 whitespace-nowrap`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600 font-semibold">
                              Quantité: {order.quantity} {order.unite}
                            </p>
                            <p className="text-green-600 font-bold">
                              Prix: {order.price.toLocaleString()} Ar
                            </p>
                            
                            <div className="flex flex-wrap gap-3 mt-2">
                              {userRole === Role.ADMIN && (
                                <>
                                  <p className="text-gray-600 flex items-center gap-1">
                                    <User size={14} />
                                    Acheteur: {order.buyer}
                                  </p>
                                  <p className="text-gray-600 flex items-center gap-1">
                                    <User size={14} />
                                    Vendeur: {order.seller}
                                  </p>
                                </>
                              )}
                              {userRole === Role.PAYSAN && (
                                <p className="text-gray-600 flex items-center gap-1">
                                  <User size={14} />
                                  Acheteur: {order.buyer}
                                </p>
                              )}
                              {userRole === Role.COLLECTEUR && (
                                <p className="text-gray-600 flex items-center gap-1">
                                  <User size={14} />
                                  Vendeur: {order.seller}
                                </p>
                              )}
                              <p className="text-gray-600 flex items-center gap-1">
                                <MapPin size={14} />
                                {order.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex flex-col gap-2 text-sm text-gray-600 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="shrink-0" />
                          <span>Commandé le {order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="shrink-0" />
                          <span>Livraison: {order.deliveryDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {userRole === Role.PAYSAN && order.status === OrderStatus.PENDING && isUserSeller && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAcceptOrder(order.id);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check size={18} className="mr-2" />
                          Accepter
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRejectOrder(order.id);
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X size={18} className="mr-2" />
                          Refuser
                        </Button>
                      </div>
                    )}

                    {order.status === OrderStatus.ACCEPTED && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t">
                        <Button
                          onClick={(e) => e.preventDefault()}
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageSquare size={18} className="mr-2" />
                          Contacter
                        </Button>
                        {userRole === Role.COLLECTEUR && isUserBuyer && (
                          <Button
                            onClick={(e) => e.preventDefault()}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign size={18} className="mr-2" />
                            Payer
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })
          )}
        </TabsContent>

        {/* Tab Demandes de Produits */}
        <TabsContent value="requests" className="space-y-4 mt-6">
          {productRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune demande de produit disponible</p>
            </Card>
          ) : (
            productRequests.map((request) => (
              <Card key={request.id} className="p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Informations de la demande */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      🔍
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-blue-600">
                          Recherche: {request.produitRecherche}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                          <AlertCircle size={14} />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 font-semibold">
                          Quantité demandée: {request.quantiteTotal} {request.unite}
                        </p>
                        {request.prixUnitaire && (
                          <p className="text-green-600 font-bold">
                            Prix proposé: {request.prixUnitaire.toLocaleString()} Ar/{request.unite}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mt-2">
                          <p className="text-gray-600 flex items-center gap-1">
                            <User size={14} />
                            Collecteur: {request.collecteur.prenom} {request.collecteur.nom}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin size={14} />
                            {request.territoire} (rayon {request.rayon}km)
                          </p>
                          {request.responsesCount !== undefined && (
                            <Badge variant="outline" className="text-purple-600">
                              {request.responsesCount} réponse(s)
                            </Badge>
                          )}
                        </div>

                        {request.messageCollecteur && (
                          <p className="text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg italic">
                            "{request.messageCollecteur}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates et actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Publié le {request.createdAt}</span>
                      </div>
                      {request.dateLivraisonPrevue && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Livraison: {request.dateLivraisonPrevue}</span>
                        </div>
                      )}
                    </div>

                    {userRole === Role.PAYSAN && (
                      <Button
                        onClick={() => handleRespondToRequest(request.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare size={18} className="mr-2" />
                        Répondre
                      </Button>
                    )}

                    {userRole === Role.COLLECTEUR && request.collecteur.id === user?.id && (
                      <Button
                        onClick={() => navigate(`/orders/requests/${request.id}`)}
                        variant="outline"
                        className="w-full"
                      >
                        Voir les réponses
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Orders;