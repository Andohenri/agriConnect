import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UserService from "@/service/user.service";
import { useForm, type SubmitHandler } from "react-hook-form";
import InputField from "@/components/composant/forms/InputField";
import { Button } from "@/components/ui/button";
import FooterLink from "@/components/composant/forms/FooterLink";

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInRequest>({
    defaultValues: {
      email: '',
      mot_de_passe: '',
    },
    mode: 'onBlur',
  })


  const onSubmit = async (data: SignInRequest) => {
    try {
      const response = await UserService.signIn(data);
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
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            🌾 AgriConnect
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<SignInRequest>)} className="space-y-4">
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
                value: 8,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Doit contenir majuscule, minuscule et chiffre'
              }
            }}
          />

          <Button type="submit" disabled={isSubmitting} className="btn-primary h-14 w-full mt-5">
            {isSubmitting ? 'Connexion...' : "Se connecter"}
          </Button>

          <FooterLink text="Pas encore de compte ?" linkText="S'inscrire" href="/sign-up" />
        </form>
      </div>
    </div>
  );
};

export default SignIn;
