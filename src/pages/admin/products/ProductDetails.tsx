// src/pages/admin/AdminProductDetail.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/contexts/ProductContext";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Package,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle,
  User,
  Activity,
  Eye,
  ToggleLeft,
  ToggleRight,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate, formatPrice, formatQuantity, PRODUCT_STATUT_CONFIG, PRODUCT_TYPE_LABELS, UNITE_LABELS } from "@/lib/utils";
import { ProductStatut, ProductType } from "@/types/enums";
import { ProductService } from "@/service/product.service";

const AdminProductDetail = () => {
  const { id } = useParams();
  const { product: contextProduct, setProduct } = useProduct();
  const navigate = useNavigate();

  const [product, setProductState] = useState<Product | null>(contextProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Charger le produit si pas dans le context
  useEffect(() => {
    if (!product && id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await ProductService.getProductById(productId);
      setProductState(data);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Erreur lors du chargement du produit');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!product?.id) return;

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await ProductService.deleteProduct(product.id);
      toast.success('Produit supprimé avec succès');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuspend = async () => {
    if (!product?.id) return;

    const action = product.statut === ProductStatut.DISPONIBLE ? 'suspendre' : 'réactiver';
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir ${action} ce produit ?`
    );

    if (!confirmed) return;

    setIsToggling(true);
    try {
      const newStatus = (product.statut === ProductStatut.DISPONIBLE 
        ? ProductStatut.RUPTURE 
        : ProductStatut.DISPONIBLE) as ProductStatut;
      
      const updatedProduct: Product = { ...product, statut: newStatus };
      // convert to FormData because the service expects multipart/form-data
      const formData = new FormData();
      // Append the whole product as JSON; backend can parse this field.
      formData.append("product", JSON.stringify(updatedProduct));
      await ProductService.updateProduct(product.id, formData);
      setProductState(updatedProduct);
      setProduct(updatedProduct);
      
      toast.success(
        newStatus === ProductStatut.DISPONIBLE 
          ? 'Produit réactivé avec succès' 
          : 'Produit suspendu avec succès'
      );
      
      await loadProduct(product.id);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setIsToggling(false);
    }
  };

  const handleViewFarmer = () => {
    if (product?.paysan?.id) {
      navigate(`/admin/farmers/${product.paysan.id}`);
    }
  };

  const handleViewOrders = () => {
    if (product?.id) {
      navigate(`/admin/orders?productId=${product.id}`);
    }
  };

  const handleBack = () => {
    setProduct(null);
    navigate('/admin/products');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle size={48} className="text-gray-400" />
        <p className="text-gray-600">Produit introuvable</p>
        <Button className="btn-primary" onClick={handleBack}>Retour à la gestion</Button>
      </div>
    );
  }

  const statutConfig = PRODUCT_STATUT_CONFIG[product.statut || ProductStatut.DISPONIBLE];
  const isAvailable = product.statut === ProductStatut.DISPONIBLE;

  return (
    <section className="space-y-6">
      {/* Header Admin */}
      <div className="flex items-center justify-between">
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
          <div>
            <h2 className="text-2xl font-bold">Gestion du Produit</h2>
            <p className="text-sm text-gray-500">Vue administrateur</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSuspend}
            disabled={isToggling}
            variant={isAvailable ? "outline" : "default"}
            className={`flex items-center gap-2 ${isAvailable ? 'text-orange-600 border-orange-600 hover:bg-orange-50' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            {isToggling ? 'Traitement...' : isAvailable ? 'Suspendre' : 'Réactiver'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images et infos principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden p-0!">
            {/* Image du produit */}
            <div className="h-96 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">
                  {product.type === ProductType.GRAIN ? '🌾' :
                    product.type === ProductType.LEGUMINEUSE ? '🫘' :
                      product.type === ProductType.TUBERCULE ? '🥔' :
                        product.type === ProductType.FRUIT ? '🍎' :
                          product.type === ProductType.LEGUME ? '🥬' :
                            product.type === ProductType.EPICE ? '🌶️' : '📦'}
                </span>
              )}
              
              {/* Badge Admin */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-purple-600 text-white">
                  👑 Vue Admin
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Titre et badges */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">{product.nom}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={statutConfig.variant}
                      className={statutConfig.color}
                    >
                      {isAvailable ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                      {statutConfig.label}
                    </Badge>

                    {product.sousType && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {product.sousType}
                      </Badge>
                    )}

                    <Badge variant="outline" className="bg-purple-100 text-purple-700">
                      {PRODUCT_TYPE_LABELS[product.type]}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-4xl font-bold text-green-600">
                    {formatPrice(product.prixUnitaire)} Ar
                  </p>
                  <p className="text-gray-500">
                    par {product.unite ? UNITE_LABELS[product.unite] : 'unité'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="border-t pt-4">
                  <h4 className="font-bold text-lg mb-3">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Informations détaillées */}
              <div className="border-t pt-4">
                <h4 className="font-bold text-lg mb-4">Détails du Produit</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Package className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Quantité disponible</p>
                      <p className="font-bold">
                        {formatQuantity(product.quantiteDisponible, product.unite)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Date de récolte</p>
                      <p className="font-bold">
                        {formatDate(product.dateRecolte)}
                      </p>
                    </div>
                  </div>

                  {product.datePeremption && (
                    <div className="flex items-start gap-3">
                      <Calendar className="text-orange-600 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Date de péremption</p>
                        <p className="font-bold text-orange-600">
                          {formatDate(product.datePeremption)}
                        </p>
                      </div>
                    </div>
                  )}

                  {product.localisation && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-green-600 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Localisation</p>
                        <p className="font-bold">{product.localisation.adresse}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditions de stockage */}
              {product.conditionsStockage && (
                <div className="border-t pt-4">
                  <h4 className="font-bold text-lg mb-3">Conditions de Stockage</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {product.conditionsStockage}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Statistiques Admin */}
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">📊 Statistiques</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Eye className="mx-auto text-blue-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-600">Vues</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ShoppingCart className="mx-auto text-green-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-600">Commandes</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Activity className="mx-auto text-purple-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-xs text-gray-600">En cours</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <CheckCircle className="mx-auto text-orange-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-xs text-gray-600">Livrées</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Admin */}
        <div className="space-y-6">
          {/* Actions Admin */}
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">⚙️ Actions Administrateur</h4>
            <div className="space-y-3">
              <Button
                onClick={handleSuspend}
                disabled={isToggling}
                variant={isAvailable ? "outline" : "default"}
                className={`w-full h-12 ${isAvailable ? 'text-orange-600 border-orange-600 hover:bg-orange-50' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {isToggling ? 'Traitement...' : isAvailable ? 'Suspendre le produit' : 'Réactiver le produit'}
              </Button>

              <Button
                onClick={handleViewOrders}
                variant="outline"
                className="w-full h-12"
              >
                <ShoppingCart size={20} />
                Voir les commandes
              </Button>

              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="w-full h-12"
              >
                <Trash2 size={20} />
                {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
              </Button>
            </div>
          </Card>

          {/* Informations du producteur */}
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">👨‍🌾 Producteur</h4>
            <div className="space-y-4">
              {/* Avatar et nom */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {product.paysan?.nom?.charAt(0) || 'P'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">
                    {product.paysan?.nom && product.paysan?.prenom
                      ? `${product.paysan.nom} ${product.paysan.prenom}`
                      : 'Producteur'}
                  </p>
                  <p className="text-xs text-gray-500">ID: {product.paysan?.id}</p>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-2 pt-4 border-t">
                {product.paysan?.telephone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="shrink-0" />
                    <span className="text-sm">{product.paysan.telephone}</span>
                  </div>
                )}

                {product.paysan?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} className="shrink-0" />
                    <span className="text-sm">{product.paysan.email}</span>
                  </div>
                )}

                {product.localisation && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-sm">{product.localisation.adresse}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleViewFarmer}
                variant="outline"
                className="w-full mt-4"
              >
                <User size={18} />
                Voir le profil complet
              </Button>
            </div>
          </Card>

          {/* Métadonnées */}
          <Card className="p-4 text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>ID Produit:</span>
              <span className="font-mono font-bold">{product.id}</span>
            </div>
            {product.createdAt && (
              <div className="flex justify-between">
                <span>Créé le:</span>
                <span className="font-bold">{formatDate(product.createdAt)}</span>
              </div>
            )}
            {product.updatedAt && (
              <div className="flex justify-between">
                <span>Modifié le:</span>
                <span className="font-bold">{formatDate(product.updatedAt)}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdminProductDetail;