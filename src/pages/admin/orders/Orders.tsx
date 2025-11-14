/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Target,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  TrendingUp,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import { useNavigate } from "react-router-dom";
import { OrderService } from "@/service/order.service";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await OrderService.getAllOrders();
      console.log("Orders response:", response.data);
      if (response?.data) {
        setOrders(response.data);
      } else {
        console.warn("Unexpected orders response:", response);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setIsLoading(false);
    }
  };

  // Séparer commandes directes et demandes
  const directOrders = orders.filter(
    (order) => !order.produitRecherche && !order.territoire
  );
  const orderRequests = orders.filter(
    (order) => order.produitRecherche && order.territoire
  );

  // Filtrer les commandes
  const filteredOrders = (ordersList: Order[]) => {
    let filtered = [...ordersList];

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.produitRecherche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.collecteur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.collecteur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.territoire?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.statut === selectedStatus);
    }

    return filtered;
  };

  // Statistiques
  const stats = {
    total: orders.length,
    direct: directOrders.length,
    requests: orderRequests.length,
    pending: orders.filter((o) => o.statut === CommandeStatut.EN_ATTENTE).length,
    accepted: orders.filter((o) => o.statut === CommandeStatut.ACCEPTEE).length,
    completed: orders.filter((o) => o.statut === CommandeStatut.COMPLETE).length,
    cancelled: orders.filter((o) => o.statut === CommandeStatut.ANNULEE).length,
  };

  // Configuration des statuts
  const getStatusConfig = (status?: CommandeStatut) => {
    const configs = {
      [CommandeStatut.EN_ATTENTE]: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-700",
        icon: <Clock size={14} />,
      },
      [CommandeStatut.OUVERTE]: {
        label: "Ouverte",
        color: "bg-blue-100 text-blue-700",
        icon: <Target size={14} />,
      },
      [CommandeStatut.ACCEPTEE]: {
        label: "Acceptée",
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle size={14} />,
      },
      [CommandeStatut.PARTIELLEMENT_FOURNIE]: {
        label: "Partiellement fournie",
        color: "bg-orange-100 text-orange-700",
        icon: <TrendingUp size={14} />,
      },
      [CommandeStatut.COMPLETE]: {
        label: "Complète",
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle size={14} />,
      },
      [CommandeStatut.LIVREE]: {
        label: "Livrée",
        color: "bg-purple-100 text-purple-700",
        icon: <CheckCircle size={14} />,
      },
      [CommandeStatut.ANNULEE]: {
        label: "Annulée",
        color: "bg-red-100 text-red-700",
        icon: <XCircle size={14} />,
      },
    };
    const key = (status ?? CommandeStatut.EN_ATTENTE) as keyof typeof configs;
    return configs[key];
  };

  const getLineStatusConfig = (status?: StatutCommandeLigne) => {
    const configs = {
      [StatutCommandeLigne.EN_ATTENTE]: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-700",
      },
      [StatutCommandeLigne.ACCEPTEE]: {
        label: "Acceptée",
        color: "bg-green-100 text-green-700",
      },
      [StatutCommandeLigne.REJETEE]: {
        label: "Rejetée",
        color: "bg-red-100 text-red-700",
      },
      [StatutCommandeLigne.LIVREE]: {
        label: "Livrée",
        color: "bg-purple-100 text-purple-700",
      },
    };
    return status ? configs[status] : configs[StatutCommandeLigne.EN_ATTENTE];
  };

  const handleViewDetails = (orderId?: string) => {
    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
    }
  };

  const calculateOrderTotal = (order: Order) => {
    if (!order.lignes || order.lignes.length === 0) {
      const qty = typeof order.quantiteTotal === "string"
        ? parseFloat(order.quantiteTotal)
        : order.quantiteTotal || 0;
      const price = typeof order.prixUnitaire === "string"
        ? parseFloat(order.prixUnitaire)
        : order.prixUnitaire || 0;
      return qty * price;
    }

    return order.lignes.reduce((total, line) => {
      const sousTotal = typeof line.sousTotal === "string"
        ? parseFloat(line.sousTotal)
        : line.sousTotal || 0;
      return total + sousTotal;
    }, 0);
  };

  if (isLoading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Gestion des Commandes</h1>
            <p className="text-gray-600 mt-1">
              Supervision de toutes les transactions de la plateforme
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Directes</p>
                <p className="text-xl font-bold">{stats.direct}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Target className="text-cyan-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Demandes</p>
                <p className="text-xl font-bold">{stats.requests}</p>
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Acceptées</p>
                <p className="text-xl font-bold">{stats.accepted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Complètes</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Annulées</p>
                <p className="text-xl font-bold">{stats.cancelled}</p>
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
            placeholder="Rechercher par produit, collecteur, territoire..."
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
            <option value={CommandeStatut.EN_ATTENTE}>En attente</option>
            <option value={CommandeStatut.OUVERTE}>Ouverte</option>
            <option value={CommandeStatut.ACCEPTEE}>Acceptée</option>
            <option value={CommandeStatut.PARTIELLEMENT_FOURNIE}>Partiellement fournie</option>
            <option value={CommandeStatut.COMPLETE}>Complète</option>
            <option value={CommandeStatut.LIVREE}>Livrée</option>
            <option value={CommandeStatut.ANNULEE}>Annulée</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Toutes ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Directes ({stats.direct})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Target size={16} />
            Demandes ({stats.requests})
          </TabsTrigger>
        </TabsList>

        {/* Toutes les commandes */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredOrders(orders).length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune commande trouvée</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders(orders).map((order) => {
                const statusConfig = getStatusConfig(order.statut);
                const total = calculateOrderTotal(order);
                const isDirect = !order.produitRecherche && !order.territoire;

                return (
                  <Card
                    key={order.id}
                    className="p-6 hover:shadow-xl transition cursor-pointer"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Icône et Type */}
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 ${isDirect ? 'bg-purple-100' : 'bg-cyan-100'} rounded-xl flex items-center justify-center text-3xl shrink-0`}>
                          {isDirect ? "📦" : "🔍"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={isDirect ? "bg-purple-50 text-purple-700" : "bg-cyan-50 text-cyan-700"}>
                              {isDirect ? "Commande Directe" : "Demande"}
                            </Badge>
                            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-bold mb-2">
                            {order.produitRecherche || "Commande Multi-Produits"}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User size={14} />
                              <span>
                                <strong>Collecteur:</strong>{" "}
                                {order.collecteur
                                  ? `${order.collecteur.prenom} ${order.collecteur.nom}`
                                  : "Non spécifié"}
                              </span>
                            </div>

                            {order.territoire && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={14} />
                                <span>
                                  <strong>Zone:</strong> {order.territoire} ({order.rayon}km)
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={14} />
                              <span>
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                                  : "Date inconnue"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <Package size={14} />
                              <span>
                                <strong>Quantité:</strong> {order.quantiteTotal} {order.unite}
                              </span>
                            </div>

                            {order.prixUnitaire && (
                              <div className="flex items-center gap-2 text-green-600 font-semibold">
                                <DollarSign size={14} />
                                <span>{total.toLocaleString()} Ar</span>
                              </div>
                            )}

                            {order.lignes && order.lignes.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <AlertCircle size={14} />
                                <span>
                                  <strong>{order.lignes.length}</strong> proposition(s)
                                </span>
                              </div>
                            )}
                          </div>

                          {order.messageCollecteur && (
                            <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg italic">
                              "{order.messageCollecteur}"
                            </p>
                          )}

                          {/* Afficher les lignes de commande si présentes */}
                          {order.lignes && order.lignes.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-sm font-semibold text-gray-700">Propositions :</p>
                              <div className="grid gap-2">
                                {order.lignes.slice(0, 2).map((line) => {
                                  const lineStatusConfig = getLineStatusConfig(line.statutLigne);
                                  return (
                                    <div
                                      key={line.id}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                                    >
                                      <div className="flex-1">
                                        <span className="font-semibold">{line.produit?.nom}</span>
                                        <span className="text-gray-600 ml-2">
                                          {line.quantiteFournie} {order.unite} × {typeof line.prixUnitaire === "string" ? parseFloat(line.prixUnitaire) : line.prixUnitaire} Ar
                                        </span>
                                      </div>
                                      <Badge className={lineStatusConfig.color} variant="secondary">
                                        {lineStatusConfig.label}
                                      </Badge>
                                    </div>
                                  );
                                })}
                                {order.lignes.length > 2 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{order.lignes.length - 2} autre(s) proposition(s)
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(order.id);
                          }}
                        >
                          <Eye size={16} />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Commandes directes */}
        <TabsContent value="direct" className="space-y-4 mt-6">
          {filteredOrders(directOrders).length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune commande directe trouvée</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders(directOrders).map((order) => {
                const statusConfig = getStatusConfig(order.statut);
                const total = calculateOrderTotal(order);

                return (
                  <Card
                    key={order.id}
                    className="p-6 hover:shadow-xl transition cursor-pointer"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl shrink-0">
                          📦
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Commande Directe
                            </Badge>
                            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-bold mb-2">
                            Commande #{order.id?.slice(0, 8)}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>
                                {order.collecteur
                                  ? `${order.collecteur.prenom} ${order.collecteur.nom}`
                                  : "Non spécifié"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                                  : "Date inconnue"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Package size={14} />
                              <span>{order.lignes?.length || 0} produit(s)</span>
                            </div>

                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <DollarSign size={14} />
                              <span>{total.toLocaleString()} Ar</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="self-start">
                        <Eye size={16} className="mr-2" />
                        Détails
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Demandes */}
        <TabsContent value="requests" className="space-y-4 mt-6">
          {filteredOrders(orderRequests).length === 0 ? (
            <Card className="p-12 text-center">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune demande trouvée</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders(orderRequests).map((order) => {
                const statusConfig = getStatusConfig(order.statut);
                const total = calculateOrderTotal(order);

                return (
                  <Card
                    key={order.id}
                    className="p-6 hover:shadow-xl transition cursor-pointer"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center text-3xl shrink-0">
                          🔍
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
                              Demande de Produit
                            </Badge>
                            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-bold mb-2 text-cyan-600">
                            Recherche: {order.produitRecherche}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>
                                {order.collecteur
                                  ? `${order.collecteur.prenom} ${order.collecteur.nom}`
                                  : "Non spécifié"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>
                                {order.territoire} ({order.rayon}km)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Package size={14} />
                              <span>
                                {order.quantiteTotal} {order.unite}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <AlertCircle size={14} />
                              <span>{order.lignes?.length || 0} proposition(s)</span>
                            </div>
                          </div>

                          {order.messageCollecteur && (
                            <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg italic">
                              "{order.messageCollecteur}"
                            </p>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="self-start">
                        <Eye size={16} className="mr-2" />
                        Détails
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AdminOrders;