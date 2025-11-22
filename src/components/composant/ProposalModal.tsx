import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InputField from "@/components/composant/forms/InputField";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Target,
  User,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  formatPrice,
  formatDate,
  UNITE_LABELS,
  PRODUCT_TYPE_LABELS,
  cn,
} from "@/lib/utils";
import { toast } from "sonner";
import { OrderService } from "@/service/order.service";
import { ProductStatut } from "@/types/enums";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProductService } from "@/service/product.service";
import { useAuth } from "@/contexts/AuthContext";
import { Role, CommandeStatut, StatutCommandeLigne } from "@/types/enums";

export interface ProposalFormData {
  produitId: string;
  quantite: number;
  prixUnitaire: number;
}

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  paysanId?: string;
}

export function ProposalModal({ isOpen, onClose, order }: ProposalModalProps) {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [paysanProducts, setPaysanProducts] = useState<Product[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProposalFormData>({
    defaultValues: {
      produitId: "",
      quantite: undefined,
      prixUnitaire: undefined,
    },
  });

  useEffect(() => {
    if (user?.role === Role.PAYSAN) {
      fetchPaysanProducts();
    }
  }, []);

  const fetchPaysanProducts = async () => {
    try {
      const response = await ProductService.getAllProductsPaysan(1, 100);
      setPaysanProducts(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits du paysan:", error);
    }
  };

  const watchQuantite = watch("quantite");
  const watchPrix = watch("prixUnitaire");

  const total = watchQuantite && watchPrix ? watchQuantite * watchPrix : 0;

  // Filtrer les produits pertinents (même unité si possible)
  const relevantProducts = paysanProducts.filter(
    (p) =>
      p.statut === ProductStatut.DISPONIBLE &&
      Number(p.quantiteDisponible) > 0 &&
      p.unite === order.unite
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setOpenCombobox(false);
    reset({
      produitId: product.id,
      quantite: undefined,
      prixUnitaire: product.prixUnitaire,
    });
  };

  const onSubmit = async (data: ProposalFormData) => {
    try {
      await OrderService.createProposal(order.id!, {
        produitId: data.produitId,
        quantite: data.quantite,
        prixUnitaire: data.prixUnitaire,
      });

      toast.success("Proposition envoyée avec succès !");
      reset();
      setSelectedProduct(null);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi de la proposition");
    }
  };

  const handleClose = () => {
    reset();
    setSelectedProduct(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto scrollbar-hide-default"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="text-blue-600" size={28} />
            Proposer une Offre
          </DialogTitle>
          <DialogDescription className="text-base">
            Sélectionnez un produit et proposez votre offre au collecteur
          </DialogDescription>
        </DialogHeader>

        {/* Résumé de la demande */}
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center text-2xl shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">
                  Demande du collecteur
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package size={14} className="text-blue-600" />
                    <span className="font-semibold">
                      {order.produitRecherche} - {order.quantiteTotal}{" "}
                      {order.unite && UNITE_LABELS[order.unite]} recherché(s)
                    </span>
                  </div>
                  {order.collecteur && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={14} className="text-blue-600" />
                      <span>
                        {order.collecteur.nom} {order.collecteur.prenom}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Target size={14} className="text-blue-600" />
                    <span>{order.territoire}</span>
                    {order.rayon && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs font-medium">
                          {order.rayon} km
                        </span>
                      </>
                    )}
                  </div>
                  {order.createdAt && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} />
                      <span className="text-xs">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sélection du produit avec Combobox */}
        <div className="space-y-3">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Package size={20} className="text-green-600" />
            Sélectionnez votre produit
          </h4>

          {relevantProducts.length === 0 ? (
            <Card className="p-6 text-center bg-gray-50">
              <AlertCircle size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">
                Aucun produit disponible correspondant à cette demande.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Assurez-vous d'avoir des produits avec la même unité de mesure.
              </p>
            </Card>
          ) : (
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between h-auto min-h-[60px] py-3"
                >
                  {selectedProduct ? (
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="w-12 h-12 bg-linear-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-xl shrink-0">
                        {selectedProduct.imageUrl ? (
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.nom}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span>🌾</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">
                          {selectedProduct.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedProduct.quantiteDisponible}{" "}
                          {selectedProduct.unite
                            ? UNITE_LABELS[selectedProduct.unite]
                            : "unités"}{" "}
                          • {formatPrice(selectedProduct.prixUnitaire)} Ar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Rechercher et sélectionner un produit...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Rechercher un produit..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                    <CommandGroup>
                      {relevantProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.nom} ${product.type} ${
                            product.sousType || ""
                          }`}
                          onSelect={() => handleProductSelect(product)}
                          className="cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-linear-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-xl shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.nom}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span>🌾</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm line-clamp-1">
                                  {product.nom}
                                </p>
                              </div>
                              <div className="flex gap-1.5 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {PRODUCT_TYPE_LABELS[product.type]}
                                </Badge>
                                {product.sousType && (
                                  <Badge className="text-xs bg-green-200 text-green-800">
                                    {product.sousType}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Package
                                    size={12}
                                    className="text-green-600"
                                  />
                                  {product.quantiteDisponible}{" "}
                                  {product.unite
                                    ? UNITE_LABELS[product.unite]
                                    : "unités"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp
                                    size={12}
                                    className="text-green-600"
                                  />
                                  <span className="font-semibold text-green-700">
                                    {formatPrice(product.prixUnitaire)} Ar
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              selectedProduct?.id === product.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Formulaire de proposition */}
        {selectedProduct && (
          <div className="space-y-4">
            <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-green-600" />
                  Détails de votre proposition
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    name="quantite"
                    label={`Quantité proposée (${
                      selectedProduct.unite
                        ? UNITE_LABELS[selectedProduct.unite]
                        : "unité"
                    })`}
                    type="number"
                    placeholder="Ex: 100"
                    register={register}
                    error={errors.quantite}
                    validation={{
                      required: "La quantité est requise",
                      min: { value: 1, message: "Minimum 1" },
                      max: {
                        value: Math.min(
                          Number(selectedProduct.quantiteDisponible),
                          Number(order.quantiteTotal)
                        ),
                        message: `Maximum ${Math.min(
                          Number(selectedProduct.quantiteDisponible),
                          Number(order.quantiteTotal)
                        )} disponible(s)`,
                      },
                    }}
                  />

                  <InputField
                    name="prixUnitaire"
                    label={`Prix unitaire (Ar/${
                      selectedProduct.unite
                        ? UNITE_LABELS[selectedProduct.unite]
                        : "unité"
                    })`}
                    type="number"
                    placeholder="Ex: 2500"
                    register={register}
                    error={errors.prixUnitaire}
                    validation={{
                      required: "Le prix est requis",
                      min: {
                        value: 1,
                        message: "Le prix doit être supérieur à 0",
                      },
                    }}
                  />
                </div>

                {/* Total */}
                {total > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-lg border-2 border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">
                        Total de la proposition :
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(total)} Ar
                      </span>
                    </div>
                    {watchQuantite && (
                      <p className="text-xs text-gray-500 mt-1">
                        {watchQuantite}{" "}
                        {selectedProduct.unite &&
                          UNITE_LABELS[selectedProduct.unite]}{" "}
                        × {formatPrice(watchPrix)} Ar = {formatPrice(total)} Ar
                      </p>
                    )}
                  </div>
                )}

                {/* Info restante */}
                {watchQuantite &&
                  Number(watchQuantite) < Number(order.quantiteTotal) && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        ℹ️ Votre proposition couvre {watchQuantite} /{" "}
                        {order.quantiteTotal}{" "}
                        {order.unite && UNITE_LABELS[order.unite]} demandé(s)
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="mr-2" />
                    Envoyer la proposition
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!selectedProduct && relevantProducts.length > 0 && (
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
