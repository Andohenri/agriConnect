import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InputField from "@/components/composant/forms/InputField";
import { LocationField } from "@/components/composant/forms/LocationField";
import TextareaField from "@/components/composant/forms/TextareaField";
import { UNITE_LABELS, formatPrice, PRODUCT_TYPE_LABELS } from "@/lib/utils";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderService } from "@/service/order.service";

export interface PropositionFormData {
  paysanId?: string;
  produitId?: string;
  quantiteAccordee: number;
  prixUnitaire: number;
  dateLivraisonPrevue: string;
  adresseLivraison: string;
  latitude?: number;
  longitude?: number;
  messageCollecteur: string;
}

interface OrderModalProps {
  product?: Product;
  disableTrigger?: boolean;
  children?: React.ReactNode;
  classTrigger?: string;
}

export function OrderModal({ product, disableTrigger, children, classTrigger }: OrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PropositionFormData>({
    defaultValues: {
      paysanId: product?.paysan?.id,
      produitId: product?.id,
      quantiteAccordee: undefined,
      prixUnitaire: product?.prixUnitaire || undefined,
      dateLivraisonPrevue: "",
      adresseLivraison: "",
      latitude: undefined,
      longitude: undefined,
      messageCollecteur: "",
    },
  });

  const watchQuantite = watch("quantiteAccordee");
  const watchPrixPropose = watch("prixUnitaire");

  const total = watchQuantite && watchPrixPropose
    ? watchQuantite * watchPrixPropose
    : 0;

  const onSubmit: SubmitHandler<PropositionFormData> = async (data) => {
    try {
      console.log("📦 Proposition envoyée :", data);
      console.log("🧺 Produit concerné :", product);

      // TODO: Appel API
      await OrderService.createOrder({...data, produitId: product?.id});

      toast.success("Proposition envoyée avec succès !");
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi de la proposition");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={classTrigger}
          disabled={disableTrigger}
          aria-label={`Commander ${product?.nom}`}
        >
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto scrollbar-hide-default"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart className="text-green-600" size={28} />
              Nouvelle Proposition
            </DialogTitle>
            <DialogDescription className="text-base">
              Envoyez votre proposition d'achat au producteur
            </DialogDescription>
          </DialogHeader>

          {/* Résumé du produit */}
          {product && (
            <Card className="my-4 p-4 bg-linear-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-linear-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-3xl shrink-0">
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
                <div className="flex-1">
                  <h4 className="font-bold text-lg line-clamp-1">{product.nom}</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {PRODUCT_TYPE_LABELS[product.type]}
                    </Badge>
                    {product.sousType && (
                      <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                        {product.sousType}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Package size={14} className="text-green-600" />
                      <span>
                        {product.quantiteDisponible} {product.unite ? UNITE_LABELS[product.unite] : 'unités'} disponible(s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp size={14} className="text-green-600" />
                      <span className="font-semibold text-green-700">
                        {formatPrice(product.prixUnitaire)} Ar / {product.unite ? UNITE_LABELS[product.unite] : 'unité'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-5 py-4">
            {/* Quantité et Prix sur la même ligne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="quantiteAccordee"
                label={`Quantité souhaitée (${product?.unite ? UNITE_LABELS[product.unite] : 'unité'})`}
                type="number"
                placeholder="Ex: 200"
                register={register}
                error={errors.quantiteAccordee}
                validation={{
                  required: "La quantité est requise",
                  min: { value: 1, message: "Minimum 1" },
                  max: {
                    value: product?.quantiteDisponible || 999999,
                    message: `Maximum ${product?.quantiteDisponible} disponible(s)`
                  },
                }}
              />

              <InputField
                name="prixUnitaire"
                label={`Prix proposé (Ar/${product?.unite ? UNITE_LABELS[product.unite] : 'unité'})`}
                type="number"
                placeholder="Ex: 2500"
                register={register}
                error={errors.prixUnitaire}
                validation={{
                  required: "Le prix proposé est requis",
                  min: { value: 1, message: "Le prix doit être supérieur à 0" },
                }}
              />
            </div>

            {/* Affichage du total */}
            {total > 0 && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total estimé :</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(total)} Ar
                  </span>
                </div>
              </Card>
            )}

            {/* Date et Lieu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                placeholder=""
                name="dateLivraisonPrevue"
                label="Date de livraison souhaitée"
                type="date"
                register={register}
                error={errors.dateLivraisonPrevue}
                validation={{
                  required: "La date de livraison est requise",
                  validate: (value: any) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return selectedDate >= today || 'La date ne peut pas être dans le passé';
                  }
                }}
              />

              <LocationField
                control={control}
                localisationName="adresseLivraison"
                latitudeName="latitude"
                longitudeName="longitude"
                label="Lieu de livraison"
                required
                errors={{
                  localisation: errors.adresseLivraison,
                  latitude: errors.latitude,
                  longitude: errors.longitude,
                }}
              />
            </div>

            {/* Message */}
            <TextareaField
              name="messageCollecteur"
              label="Message pour le producteur"
              placeholder="Décrivez vos besoins, conditions particulières, modalités de paiement..."
              rows={4}
              register={register}
              error={errors.messageCollecteur}
              validation={{
                required: "Le message est requis",
                minLength: {
                  value: 10,
                  message: "Le message doit contenir au moins 10 caractères"
                },
                maxLength: {
                  value: 500,
                  message: "Le message ne peut pas dépasser 500 caractères"
                }
              }}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="submit"
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
                  <ShoppingCart size={18} className="mr-2" />
                  Envoyer la proposition
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}