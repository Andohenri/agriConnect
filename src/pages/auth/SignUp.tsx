import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import InputField from "@/components/composant/forms/InputField";
import { Button } from "@/components/ui/button";
import FooterLink from "@/components/composant/forms/FooterLink";
import SelectField from "@/components/composant/forms/SelectField";
import { LocationField } from "@/components/composant/forms/LocationField";
import { useAuth } from "@/contexts/AuthContext";
import UserService from "@/service/user.service";

const ROLES = [
  { value: 'paysan', label: 'Paysan' },
  { value: 'collecteur', label: 'Collecteur' },
  { value: 'admin', label: 'Administrateur' },
]

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignUpRequest>({
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      mot_de_passe: '',
      confirmation_mot_de_passe: '',
      role: undefined,
      adresse: '',
      localisation: '',
      latitude: undefined,
      longitude: undefined,
    },
    mode: 'onBlur',
  })


  const onSubmit = async (data: SignUpRequest) => {
    try {
      const response = await UserService.signUp(data);
      login(response.access_token);
      if (response?.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during sign up: ", error);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            🌾 AgriConnect
          </h1>
          <p className="text-gray-600">Bienvenue sur AgriConnect</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<SignUpRequest>)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="nom"
              label="Nom"
              placeholder="Votre nom"
              register={register}
              error={errors.nom}
              validation={{
                required: 'Le nom est requis',
                minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
              }}
            />

            <InputField
              name="prenom"
              label="Prénom"
              placeholder="Votre prénom"
              register={register}
              error={errors.prenom}
              validation={{
                required: 'Le prénom est requis',
                minLength: { value: 2, message: 'Le prénom doit contenir au moins 2 caractères' }
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
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
                  message: 'Email invalide'
                }
              }}
            />

            {/* Téléphone */}
            <InputField
              name="telephone"
              label="Téléphone"
              placeholder="+261 34 00 000 00"
              type="tel"
              register={register}
              error={errors.telephone}
              validation={{
                required: 'Le téléphone est requis',
                pattern: {
                  value: /^(\+261|0)[0-9]{9}$/,
                  message: 'Format: +261 34 00 000 00'
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rôle */}
            <SelectField
              name="role"
              label="Rôle"
              placeholder="Sélectionnez votre rôle"
              options={ROLES}
              error={errors.role}
              control={control}
              required
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mot de passe */}
            <InputField
              name="mot_de_passe"
              label="Mot de passe"
              placeholder="********"
              type="password"
              register={register}
              error={errors.mot_de_passe}
              validation={{
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
                },
              }}
            />
            {/* Confirmation mot de passe */}
            <InputField
              name="confirmation_mot_de_passe"
              label="Confirmer le mot de passe"
              placeholder="********"
              type="password"
              register={register}
              error={errors.confirmation_mot_de_passe}
              validation={{
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
                },
              }}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="btn-primary h-14 w-full mt-5">
            {isSubmitting ? 'Enregistrement...' : "S'inscrire"}
          </Button>

          <FooterLink text="Vous avez déjà un compte ?" linkText="Se connecter" href="/sign-in" />
        </form>
      </div>
    </div>
  );
};

export default SignUp;