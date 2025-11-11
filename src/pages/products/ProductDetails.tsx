// src/pages/products/ProductDetail.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/contexts/ProductContext";
import {
  ArrowLeft,
  Calendar,
  Edit,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  ShoppingCart,
  Star,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate, formatPrice, formatQuantity, PRODUCT_STATUT_CONFIG, PRODUCT_TYPE_LABELS, UNITE_LABELS } from "@/lib/utils";
import { Role, ProductStatut, ProductType } from "@/types/enums";
import { ProductService } from "@/service/product.service";
import { OrderModal } from "@/components/composant/OrderModal";

const ProductDetail = () => {
  const { id } = useParams();
  const { product: contextProduct, setProduct, setIsEditing } = useProduct();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProductState] = useState<Product | null>(contextProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (product) {
      setProduct(product);
      setIsEditing(true);
      navigate(`/products/add`);
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
      // await ProductService.deleteProduct(product.id);
      toast.success('Produit supprimé avec succès');
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleContact = () => {
    // Logique de contact
    if (product?.paysan?.telephone) {
      window.location.href = `tel:${product.paysan.telephone}`;
    }
  };

  const handleBack = () => {
    setProduct(null);
    navigate('/products');
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
        <Button className="btn-primary" onClick={handleBack}>Retour aux produits</Button>
      </div>
    );
  }

  const statutConfig = PRODUCT_STATUT_CONFIG[product.statut || ProductStatut.DISPONIBLE];
  const isAvailable = product.statut === ProductStatut.DISPONIBLE;
  const isOwner = user?.id === product.paysan?.id || user?.role === Role.PAYSAN;
  const isCollector = user?.role === Role.COLLECTEUR;

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
        <h2 className="text-2xl font-bold">Détails du Produit</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images et infos principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden p-0!">
            {/* Image du produit */}
            <div className="h-96 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
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
        </div>

        {/* Sidebar - Informations vendeur et actions */}
        <div className="space-y-6">
          {/* Informations du producteur */}
          <Card className="p-6">
            <h4 className="font-bold text-lg mb-4">
              Informations du Producteur
            </h4>
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
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} />
                    <span className="text-xs text-gray-500 ml-1">(4.2)</span>
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-2 pt-4 border-t">
                {product.paysan?.telephone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="shrink-0" />
                    <a
                      href={`tel:${product.paysan.telephone}`}
                      className="text-sm hover:text-green-600 transition"
                    >
                      {product.paysan.telephone}
                    </a>
                  </div>
                )}

                {product.paysan?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} className="shrink-0" />
                    <a
                      href={`mailto:${product.paysan.email}`}
                      className="text-sm hover:text-green-600 transition"
                    >
                      {product.paysan.email}
                    </a>
                  </div>
                )}

                {product.localisation && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-sm">{product.localisation.adresse}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t">
                {isCollector && isAvailable && (
                  <>
                    <OrderModal
                      product={product}
                      disableTrigger={!isAvailable}
                      classTrigger="w-full bg-green-600 hover:bg-green-700 h-12 cursor-pointer"
                    >
                      <ShoppingCart size={20} />
                      Commander
                    </OrderModal>
                    <Button
                      onClick={handleContact}
                      variant="outline"
                      className="w-full h-12"
                    >
                      <MessageSquare size={20} />
                      Contacter
                    </Button>
                  </>
                )}

                {isOwner && (
                  <>
                    <Button
                      onClick={handleEdit}
                      size="default"
                      variant="secondary"
                      className="w-full h-12 hover:bg-green-100"
                    >
                      <Edit size={20} />
                      Modifier
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      variant="destructive"
                      className="w-full h-12"
                    >
                      <Trash2 size={20} />
                      {isDeleting ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Informations utiles */}
          <Card className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 p-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              💡 Informations utiles
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Produit vérifié
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Paiement sécurisé
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Livraison disponible
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Support 24/7
              </li>
            </ul>
          </Card>

          {/* Informations supplémentaires */}
          {product.createdAt && (
            <Card className="p-4 text-sm text-gray-600">
              <p>
                Publié le {formatDate(product.createdAt)}
              </p>
              {product.updatedAt && product.updatedAt !== product.createdAt && (
                <p className="mt-1">
                  Mis à jour le {formatDate(product.updatedAt)}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;