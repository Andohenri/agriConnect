/* eslint-disable react-refresh/only-export-components */
import InputField from "@/components/composant/forms/InputField";
import SelectField from "@/components/composant/forms/SelectField";
import TextareaField from "@/components/composant/forms/TextareaField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UNITES } from "../products/AddProduct";
import { LocationField } from "@/components/composant/forms/LocationField";
import ZoneModal from "@/components/composant/ZoneModal";
import { OrderService } from "@/service/order.service";
import { useOrder } from "@/contexts/OrderContext";


const OrderPublish = () => {
  const navigate = useNavigate();
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const { order, isEditing, resetOrderState } = useOrder();
  const [selectedZone, setSelectedZone] = useState<{
    territoire: string;
    latitude: number;
    longitude: number;
    rayon: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
  } = useForm<OrderPublishReq>({
    defaultValues: {
      produitRecherche: "",
      quantiteTotal: "",
      unite: undefined,
      prixUnitaire: "",
      messageCollecteur: "",
      adresseLivraison: "",
      dateLivraisonPrevue: "",
      territoire: "",
      latitude: undefined,
      longitude: undefined,
      rayon: undefined,
    },
    mode: "onBlur",
  });

  const handleZoneSelected = (zone: {
    territoire: string;
    latitude: number;
    longitude: number;
    rayon: number;
  }) => {
    setSelectedZone(zone);
    setValue("territoire", zone.territoire);
    setValue("latitude", zone.latitude);
    setValue("longitude", zone.longitude);
    setValue("rayon", zone.rayon);
    toast.success("Zone de collecte définie");
  };

  useEffect(() => {
    if (isEditing && order) {
      // Pré-remplir le formulaire avec les données de la demande existante
      reset({
        produitRecherche: order.produitRecherche || "",
        quantiteTotal: order.quantiteTotal ? String(order.quantiteTotal) : "",
        unite: order.unite || undefined,
        prixUnitaire: order.prixUnitaire ? String(order.prixUnitaire) : "",
        messageCollecteur: order.messageCollecteur || "",
        adresseLivraison: order.adresseLivraison || "",
        dateLivraisonPrevue: order.dateLivraisonPrevue
          ? new Date(order.dateLivraisonPrevue).toISOString().split("T")[0]
          : "",
        territoire: order.territoire || "",
        latitude: order.latitude || 0,
        longitude: order.longitude || 0,
        rayon: order.rayon || 0,
      });
      setSelectedZone({
        territoire: order.territoire ?? "",
        latitude: order.latitude ?? 0,
        longitude: order.longitude ?? 0,
        rayon: order.rayon ?? 0,
      });
    }
  }, [isEditing, order, reset]);

  const onSubmit = async (data: OrderPublishReq) => {
    try {
      // Validation de la zone
      if (!selectedZone) {
        toast.error("Veuillez définir une zone de collecte");
        return;
      }
      if (isEditing && order?.id) {
        // Mise à jour de la demande existanteisEdi
        await OrderService.updateOrder(order.id, data);
        console.log("Demande de produit:", data);
        toast.success("Demande de produit mise à jour avec succès !");
      } else {
        // Création d'une nouvelle demande
        await OrderService.demmandeOrder(data);
        console.log("Demande de produit:", data);
        toast.success("Demande de produit publiée avec succès !");
      }
      resetOrderState();
      navigate("/orders");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleCancel = () => {
    resetOrderState();
    navigate(-1);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Publier une Demande de Produit</h2>
          <p className="text-sm text-gray-600 mt-1">
            Les paysans de la zone définie recevront votre demande
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations du produit recherché */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Produit Recherché
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="produitRecherche"
                label="Nom du Produit"
                placeholder="Ex: Riz, Maïs, Haricots..."
                register={register}
                error={errors.produitRecherche}
                validation={{
                  required: "Le nom du produit est requis",
                  minLength: {
                    value: 3,
                    message: "Le nom doit contenir au moins 3 caractères",
                  },
                }}
              />

              <InputField
                name="quantiteTotal"
                label="Quantité Souhaitée"
                placeholder="Ex: 500"
                type="number"
                register={register}
                error={errors.quantiteTotal}
                validation={{
                  required: "La quantité est requise",
                  min: {
                    value: 0.1,
                    message: "La quantité doit être supérieure à 0",
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                name="unite"
                label="Unité"
                placeholder="Sélectionnez une unité"
                options={UNITES}
                control={control}
                error={errors.unite}
                required
              />

              <InputField
                name="prixUnitaire"
                label="Prix Unitaire Proposé (Ar) - Optionnel"
                placeholder="Ex: 2500"
                type="number"
                register={register}
                error={errors.prixUnitaire}
                validation={{
                  min: {
                    value: 0,
                    message: "Le prix doit être positif",
                  },
                }}
              />
            </div>
          </div>

          {/* Message et détails */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Détails de la Demande
            </h3>

            <TextareaField
              name="messageCollecteur"
              label="Message aux Paysans"
              placeholder="Décrivez vos besoins spécifiques, qualité souhaitée, conditions particulières..."
              rows={4}
              register={register}
              error={errors.messageCollecteur}
              validation={{
                maxLength: {
                  value: 1000,
                  message: "Le message ne peut pas dépasser 1000 caractères",
                },
              }}
            />
          </div>

          {/* Livraison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Informations de Livraison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Localisation */}
              <LocationField
                control={control}
                localisationName="adresseLivraison"
                latitudeName="latitudeLivraison"
                longitudeName="longitudeLivraison"
                label="Localisation"
                required
                errors={{
                  localisation: errors.adresseLivraison,
                }}
              />

              <InputField
                name="dateLivraisonPrevue"
                label="Date de Livraison Souhaitée - Optionnel"
                placeholder=""
                type="date"
                register={register}
                error={errors.dateLivraisonPrevue}
                validation={{
                  validate: (value: any) => {
                    if (!value) return true;
                    const selectedDate = new Date(value);
                    const today = new Date();
                    return selectedDate >= today || "La date doit être future";
                  },
                }}
              />
            </div>
          </div>

          {/* Zone de collecte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <MapPin className="text-green-600" size={20} />
              Zone de Collecte
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              {selectedZone ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-green-700">
                        Zone définie ✓
                      </p>
                      <div className="text-sm text-gray-700 mt-2 space-y-1">
                        <p>
                          📍 <strong>Territoire:</strong>{" "}
                          {selectedZone.territoire}
                        </p>
                        <p>
                          🎯 <strong>Rayon:</strong> {selectedZone.rayon} km
                        </p>
                        <p className="text-xs text-gray-500">
                          Coordonnées: {selectedZone.latitude.toFixed(4)},{" "}
                          {selectedZone.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsZoneModalOpen(true)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">
                    Définissez une zone de collecte pour cibler les paysans
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIsZoneModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MapPin size={18} className="mr-2" />
                    Définir la Zone
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 flex items-start gap-2">
              <Calendar size={14} className="mt-0.5 shrink-0" />
              Les paysans situés dans cette zone recevront une notification de
              votre demande
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-12 w-full"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !selectedZone}
              className="btn-primary h-12 w-full"
            >
              {isSubmitting ? "Publication..." : "Publier la Demande"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Zone Modal */}
      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        onZoneSelected={handleZoneSelected}
      />
    </section>
  );
};

export default OrderPublish;
