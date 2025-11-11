import { Link } from 'react-router-dom';
import { Package, Calendar, ShoppingCart, Edit, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice, formatQuantity, PRODUCT_STATUT_CONFIG, PRODUCT_TYPE_ICONS, PRODUCT_TYPE_LABELS, UNITE_LABELS } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Role, ProductStatut } from '@/types/enums';
import { useProduct } from '@/contexts/ProductContext';

interface ProductCardProps {
  product: Product;
  userRole: Role | undefined;
  onCommand?: (productId: string) => void;
  onEdit?: (productId: string) => void;
}

export function ProductCard({ product, userRole, onCommand, onEdit }: ProductCardProps) {
  const statutConfig = PRODUCT_STATUT_CONFIG[product.statut || ProductStatut.DISPONIBLE];
  const productIcon = product.imageUrl || PRODUCT_TYPE_ICONS[product.type];
  const isAvailable = product.statut === ProductStatut.DISPONIBLE;
  const quantityNum = typeof product.quantiteDisponible === 'string'
    ? parseFloat(product.quantiteDisponible)
    : product.quantiteDisponible;
  const isLowStock = quantityNum < 50; // Seuil configurable

  const { setProduct } = useProduct();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation du Link

    if (!product.id) return;

    if (userRole === Role.COLLECTEUR && onCommand) {
      onCommand(product.id);
    } else if (userRole === Role.PAYSAN && onEdit) {
      onEdit(product.id);
    }
  };

  const handleSelectedProduct = () => {
    setProduct(product);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      onClick={() => handleSelectedProduct()}
      className="block group"
      aria-label={`Voir les détails de ${product.nom}`}
    >
      <Card className="overflow-hidden p-0! gap-2! hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] h-full flex flex-col">
        {/* Image du produit */}
        <div className="relative h-50 md:h-60 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.nom}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl md:text-8xl group-hover:scale-110 transition-transform duration-300">
              {productIcon}
            </span>
          )}

          {/* Badge statut */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge
              variant={statutConfig.variant}
              className={statutConfig.color}
            >
              {statutConfig.label}
            </Badge>

            {isLowStock && isAvailable && (
              <Badge variant="warning" className="bg-yellow-100 text-yellow-700">
                <AlertCircle size={12} className="mr-1" />
                Stock faible
              </Badge>
            )}
          </div>
        </div>

        {/* Header avec titre */}
        <CardHeader className="">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg md:text-xl line-clamp-2 group-hover:text-green-600 transition-colors">
                {product.nom}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm mt-1 flex items-center gap-2">
                <span>{PRODUCT_TYPE_LABELS[product.type]}</span>
                {product.sousType && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">{product.sousType}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Contenu avec détails */}
        <CardContent className="flex-1">
          <div className="space-y-2.5">
            {/* Quantité */}
            <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm">
              <Package size={14} className="shrink-0 text-green-600" />
              <span className="font-medium">
                {formatQuantity(product.quantiteDisponible, product.unite)}
              </span>
            </div>

            {/* Localisation (si disponible)
            {product.paysan?.localisation && (
              <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm">
                <MapPin size={14} className="shrink-0 text-green-600" />
                <span className="line-clamp-1">{product.paysan.localisation}</span>
              </div>
            )} */}

            {/* Date de récolte */}
            <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm">
              <Calendar size={14} className="shrink-0 text-green-600" />
              <span>Récolté le {formatDate(product.dateRecolte)}</span>
            </div>

            {/* Description courte (optionnel) */}
            {product.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-2 pt-2 border-t">
                {product.description}
              </p>
            )}
          </div>
        </CardContent>

        {/* Footer avec prix et action */}
        <CardFooter className="py-3! border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {formatPrice(product.prixUnitaire)} Ar
            </p>
            <p className="text-xs text-gray-500">
              par {product.unite ? UNITE_LABELS[product.unite] : 'unité'}
            </p>
          </div>

          {userRole === Role.COLLECTEUR ? (
            <Button
              size="default"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={handleAction}
              disabled={!isAvailable}
              aria-label={`Commander ${product.nom}`}
            >
              <ShoppingCart size={18} />
              Commander
            </Button>
          ) : userRole === Role.PAYSAN ? (
            <Button
              size="default"
              variant="secondary"
              className="w-full sm:w-auto hover:bg-green-100"
              onClick={handleAction}
              aria-label={`Modifier ${product.nom}`}
            >
              <Edit size={18} />
              Modifier
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </Link>
  );
}


export function ProductCardSkeleton() {
  return (
    <Card className="p-0! overflow-hidden h-full flex flex-col">
      <Skeleton className="h-40 md:h-48 w-full" />

      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>

      <CardContent className="flex-1 pb-3 space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </CardContent>

      <CardFooter className="py-4 border-t flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
  );
}