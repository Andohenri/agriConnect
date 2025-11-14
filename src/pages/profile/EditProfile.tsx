import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import InputField from "@/components/composant/forms/InputField";
import { Button } from "@/components/ui/button";
import { LocationField } from "@/components/composant/forms/LocationField";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  MapPin,
  Lock,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import { Role } from "@/types/enums";
import { UserService } from "@/service/user.service";

interface EditProfileFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  localisation?: string;
  latitude?: number;
  longitude?: number;
  ancien_mot_de_passe?: string;
  nouveau_mot_de_passe?: string;
  confirmation_mot_de_passe?: string;
}

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<EditProfileFormData>({
    defaultValues: {
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      adresse: user?.adresse || "",
      localisation: user?.localisation || "",
      latitude: user?.latitude || undefined,
      longitude: user?.longitude || undefined,
      ancien_mot_de_passe: "",
      nouveau_mot_de_passe: "",
      confirmation_mot_de_passe: "",
    },
    mode: "onBlur",
  });

  const nouveauMotDePasse = watch("nouveau_mot_de_passe");

  useEffect(() => {
    if (user) {
      reset({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        adresse: user.adresse || "",
        localisation: user.localisation || "",
        latitude: user.latitude || undefined,
        longitude: user.longitude || undefined,
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
        confirmation_mot_de_passe: "",
      });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<EditProfileFormData> = async (data) => {
    if (!user?.id) {
      toast.error("Utilisateur non identifié");
      return;
    }

    setIsLoading(true);
    try {
      // Préparer les données à envoyer
      const updateData: any = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        localisation: data.localisation,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      // Ajouter les mots de passe seulement si on veut les changer
      if (changePassword && data.nouveau_mot_de_passe) {
        if (data.nouveau_mot_de_passe !== data.confirmation_mot_de_passe) {
          toast.error("Les mots de passe ne correspondent pas");
          setIsLoading(false);
          return;
        }
        updateData.ancien_mot_de_passe = data.ancien_mot_de_passe;
        updateData.nouveau_mot_de_passe = data.nouveau_mot_de_passe;
      }

      // Appeler le service pour mettre à jour
      const response = await UserService.updateUser(user.id, updateData);

      if (response) {
        // Mettre à jour le contexte utilisateur
        UserService.updateProfile(updateData);
        toast.success("Profil mis à jour avec succès !");
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const getRoleConfig = (role?: Role) => {
    if (!role) return { icon: "👤", label: "Utilisateur", color: "bg-gray-100 text-gray-700" };
    
    const configs = {
      [Role.PAYSAN]: {
        icon: "👨‍🌾",
        label: "Paysan",
        color: "bg-green-100 text-green-700",
      },
      [Role.COLLECTEUR]: {
        icon: "🚚",
        label: "Collecteur",
        color: "bg-blue-100 text-blue-700",
      },
      [Role.ADMIN]: {
        icon: "🛡️",
        label: "Administrateur",
        color: "bg-purple-100 text-purple-700",
      },
    };
    return configs[role];
  };

  const roleConfig = getRoleConfig(user?.role);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Modifier mon profil</h1>
          <p className="text-gray-600 mt-1">
            Mettez à jour vos informations personnelles
          </p>
        </div>
        <Button
          onClick={handleCancel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Retour
        </Button>
      </div>

      {/* Profile Info Card */}
      <Card className="p-6 bg-linear-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-linear-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl">
            {roleConfig.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user?.prenom} {user?.nom}
            </h2>
            <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-green-600" />
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="nom"
                label="Nom"
                placeholder="Votre nom"
                register={register}
                error={errors.nom}
                validation={{
                  required: "Le nom est requis",
                  minLength: {
                    value: 2,
                    message: "Le nom doit contenir au moins 2 caractères",
                  },
                }}
              />

              <InputField
                name="prenom"
                label="Prénom"
                placeholder="Votre prénom"
                register={register}
                error={errors.prenom}
                validation={{
                  required: "Le prénom est requis",
                  minLength: {
                    value: 2,
                    message: "Le prénom doit contenir au moins 2 caractères",
                  },
                }}
              />
            </div>
          </div>

          {/* Informations de contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail size={20} className="text-green-600" />
              Informations de contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="email"
                label="Email"
                placeholder="exemple@email.com"
                type="email"
                register={register}
                error={errors.email}
                validation={{
                  required: "L'email est requis",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Email invalide",
                  },
                }}
              />

              <InputField
                name="telephone"
                label="Téléphone"
                placeholder="+261 34 00 000 00"
                type="tel"
                register={register}
                error={errors.telephone}
                validation={{
                  required: "Le téléphone est requis",
                  pattern: {
                    value: /^(\+261|0)[0-9]{9}$/,
                    message: "Format: +261 34 00 000 00",
                  },
                }}
              />
            </div>
          </div>

          {/* Adresse et localisation */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Adresse exacte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                name="adresse"
                label="Adresse"
                placeholder="Votre adresse complète ( Lot, Quartier, Ville )"
                register={register}
                error={errors.adresse}
              />

              <LocationField
                control={control}
                localisationName="localisation"
                latitudeName="latitude"
                longitudeName="longitude"
                label="Localisation GPS"
                errors={{
                  localisation: errors.localisation,
                  latitude: errors.latitude,
                  longitude: errors.longitude,
                }}
              />
            </div>
          </div>

          {/* Changement de mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock size={20} className="text-green-600" />
                Sécurité
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangePassword(!changePassword)}
              >
                {changePassword
                  ? "Annuler le changement"
                  : "Changer le mot de passe"}
              </Button>
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <InputField
                  name="ancien_mot_de_passe"
                  label="Mot de passe actuel"
                  placeholder="********"
                  type="password"
                  register={register}
                  error={errors.ancien_mot_de_passe}
                  validation={{
                    required: changePassword
                      ? "Le mot de passe actuel est requis"
                      : false,
                  }}
                />

                <InputField
                  name="nouveau_mot_de_passe"
                  label="Nouveau mot de passe"
                  placeholder="********"
                  type="password"
                  register={register}
                  error={errors.nouveau_mot_de_passe}
                  validation={{
                    required: changePassword
                      ? "Le nouveau mot de passe est requis"
                      : false,
                    minLength: {
                      value: 6,
                      message:
                        "Le mot de passe doit contenir au moins 6 caractères",
                    },
                  }}
                />

                <InputField
                  name="confirmation_mot_de_passe"
                  label="Confirmer le mot de passe"
                  placeholder="********"
                  type="password"
                  register={register}
                  error={errors.confirmation_mot_de_passe}
                  validation={{
                    required: changePassword
                      ? "La confirmation est requise"
                      : false,
                    validate: (value: string | undefined) =>
                      !changePassword ||
                      value === nouveauMotDePasse ||
                      "Les mots de passe ne correspondent pas",
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting || isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !isDirty}
              className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Votre rôle ({roleConfig.label}) ne peut pas
          être modifié. Pour toute demande de changement de rôle, veuillez
          contacter un administrateur.
        </p>
      </Card>
    </section>
  );
};

export default EditProfile;