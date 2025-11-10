import InputField from "@/components/composant/forms/InputField";
import { LocationField } from "@/components/composant/forms/LocationField";
import SelectField from "@/components/composant/forms/SelectField";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/contexts/ProductContext";
import { ArrowLeft, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProductType, Unite } from "@/types/enums";
import { Card } from "@/components/ui/card";
import TextareaField from "@/components/composant/forms/TextareaField";
import { ProductService } from "@/service/product.service";

export const PRODUCT_TYPES = [
  { value: ProductType.GRAIN, label: 'Grain' },
  { value: ProductType.LEGUMINEUSE, label: 'Légumineuse' },
  { value: ProductType.TUBERCULE, label: 'Tubercule' },
  { value: ProductType.FRUIT, label: 'Fruit' },
  { value: ProductType.LEGUME, label: 'Légume' },
  { value: ProductType.EPICE, label: 'Épice' },
  { value: ProductType.AUTRE, label: 'Autre' },
];

export const UNITES = [
  { value: Unite.KG, label: 'Kilogramme (kg)' },
  { value: Unite.TONNE, label: 'Tonne' },
  { value: Unite.SAC, label: 'Sac' },
  { value: Unite.LITRE, label: 'Litre' },
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { product, isEditing, resetProductState } = useProduct();
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      nom: '',
      type: product?.type || '',
      sousType: '',
      description: '',
      quantiteDisponible: '',
      unite: product?.unite || '',
      prixUnitaire: '',
      dateRecolte: '',
      datePeremption: '',
      conditionsStockage: '',
      localisation: '',
      latitude: undefined,
      longitude: undefined,
    },
    mode: 'onBlur',
  });

  const watchImage = watch("image");

  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [watchImage]);
  
  // Charger les données du produit si en mode édition
  useEffect(() => {
    if (isEditing && product) {
      reset({
        nom: product.nom,
        type: product.type,
        sousType: product.sousType || '',
        description: product.description || '',
        quantiteDisponible: product.quantiteDisponible,
        unite: product.unite,
        prixUnitaire: product.prixUnitaire,
        dateRecolte: product.dateRecolte
          ? typeof product.dateRecolte === 'string'
            ? product.dateRecolte.split('T')[0]
            : new Date(product.dateRecolte).toISOString().split('T')[0]
          : '',
        datePeremption: product.datePeremption
          ? typeof product.datePeremption === 'string'
            ? product.datePeremption.split('T')[0]
            : new Date(product.datePeremption).toISOString().split('T')[0]
          : '',
        conditionsStockage: product.conditionsStockage || '',
        localisation: product.localisation?.adresse || '',
        latitude: product.localisation?.latitude,
        longitude: product.localisation?.longitude,
      });
    }
  }, [isEditing, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log('Submitting form data:', data);
      const formData = new FormData();

      formData.append('nom', data.nom);
      formData.append('type', data.type || '');
      formData.append('sousType', data.sousType || '');
      formData.append('description', data.description || '');
      formData.append('quantiteDisponible', data.quantiteDisponible.toString());
      formData.append('unite', data.unite || '');
      formData.append('prixUnitaire', data.prixUnitaire.toString());
      formData.append('dateRecolte', data.dateRecolte);
      if (data.datePeremption) formData.append('datePeremption', data.datePeremption);
      if (data.conditionsStockage) formData.append('conditionsStockage', data.conditionsStockage);
      if (data.localisation) formData.append('localisation', data.localisation);
      if (data.latitude) formData.append('latitude', data.latitude.toString());
      if (data.longitude) formData.append('longitude', data.longitude.toString());

      // 👇 gestion de l’image
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      if (isEditing && product?.id) {
        await ProductService.updateProduct(product.id, formData);        
        toast.success('Produit mis à jour avec succès !');
      } else {
        await ProductService.createProduct(formData);
        toast.success('Produit ajouté avec succès !');
      }

      resetProductState();
      navigate('/products');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleCancel = () => {
    resetProductState();
    navigate('/products');
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
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
        </h2>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<ProductFormData>)} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              name="nom"
              label="Nom du Produit"
              placeholder="Ex: Riz Premium"
              register={register}
              error={errors.nom}
              validation={{
                required: 'Le nom est requis',
                minLength: {
                  value: 3,
                  message: 'Le nom doit contenir au moins 3 caractères'
                }
              }}
            />

            <SelectField
              name="type"
              label="Type de Produit"
              placeholder="Sélectionnez un type"
              options={PRODUCT_TYPES}
              control={control}
              error={errors.type}
              required
            />
            <InputField
              name="sousType"
              label="Sous-type"
              placeholder="Ex: Bio, Frais, Sec"
              register={register}
              error={errors.sousType}
              validation={{
                maxLength: {
                  value: 100,
                  message: 'Le sous-type ne peut pas dépasser 100 caractères'
                }
              }}
            />
          </div>

          {/* Quantité et Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="quantiteDisponible"
              label="Quantité Disponible"
              placeholder="Ex: 500"
              type="number"
              register={register}
              error={errors.quantiteDisponible}
              validation={{
                required: 'La quantité est requise',
                min: {
                  value: 0.1,
                  message: 'La quantité doit être supérieure à 0'
                }
              }}
            />

            <SelectField
              name="unite"
              label="Unité"
              placeholder="Sélectionnez une unité"
              options={UNITES}
              control={control}
              error={errors.unite}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="prixUnitaire"
              label="Prix Unitaire (Ar)"
              placeholder="Ex: 2500"
              type="number"
              register={register}
              error={errors.prixUnitaire}
              validation={{
                required: 'Le prix est requis',
                min: {
                  value: 1,
                  message: 'Le prix minimum est 1 Ar'
                }
              }}
            />

            <InputField
              placeholder=""
              name="dateRecolte"
              label="Date de Récolte"
              type="date"
              register={register}
              error={errors.dateRecolte}
              validation={{
                required: 'La date de récolte est requise',
                validate: (value: any) => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  return selectedDate <= today || 'La date ne peut pas être dans le futur';
                }
              }}
            />
          </div>

          {/* Date de péremption */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              placeholder=""
              name="datePeremption"
              label="Date de Péremption"
              type="date"
              register={register}
              error={errors.datePeremption}
              validation={{
                validate: (value: any) => {
                  if (!value) return true;
                  const dateRecolte = watch('dateRecolte');
                  if (dateRecolte) {
                    const peremption = new Date(value);
                    const recolte = new Date(dateRecolte);
                    return peremption > recolte || 'La date de péremption doit être après la récolte';
                  }
                  return true;
                }
              }}
            />

            {/* Localisation */}
            <LocationField
              control={control}
              localisationName="localisation"
              latitudeName="latitude"
              longitudeName="longitude"
              label="Localisation"
              required
              errors={{
                localisation: errors.localisation,
                latitude: errors.latitude,
                longitude: errors.longitude,
              }}
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaField
              name="description"
              label="Description du Produit"
              placeholder="Fournissez une description détaillée du produit"
              rows={6}
              register={register}
              error={errors.description}
              validation={{
                maxLength: {
                  value: 500,
                  message: 'La description ne peut pas dépasser 500 caractères'
                }
              }}
            />

            {/* Conditions de stockage */}
            <TextareaField
              name="conditionsStockage"
              label="Conditions de Stockage"
              placeholder="Indiquez les conditions optimales de stockage"
              rows={6}
              register={register}
              error={errors.conditionsStockage}
              validation={{
                maxLength: {
                  value: 500,
                  message: 'Les conditions de stockage ne peuvent pas dépasser 500 caractères'
                }
              }}
            />
          </div>

          {/* Upload d'image */}
          <div className="space-y-2">
            <label className="form-label">Image du Produit</label>

            {imagePreview || product?.imageUrl ? (
              <div className="relative">
                <img
                  src={imagePreview || product?.imageUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(undefined);
                  }}
                >
                  Supprimer
                </Button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition cursor-pointer block">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  Cliquez pour télécharger une image
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG jusqu'à 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("image", {
                    required: "L'image est requise",
                    validate: (files) => {
                      const file = files?.[0];
                      if (!file) return "Veuillez sélectionner une image";
                      if (!file.type.startsWith("image/")) return "Le fichier doit être une image";
                      if (file.size > 5 * 1024 * 1024) return "L'image ne doit pas dépasser 5 Mo";
                      return true;
                    },
                  })}
                />
              </label>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-12 w-full cursor-pointer"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full cursor-pointer"
            >
              {isSubmitting
                ? 'En cours...'
                : isEditing
                  ? 'Mettre à jour le produit'
                  : 'Ajouter le produit'}
            </Button>
          </div>
        </form>
      </Card>

    </section >
  );
};

export default AddProduct;
