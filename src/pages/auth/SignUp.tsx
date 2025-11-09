import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LocationCombobox } from "@/components/composant/LocationCombobox";

interface Location {
  adresse: string;
  lat: string;
  lon: string;
}

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLocationSelect = (location: Location) => {
    console.log("Adresse sélectionnée :", location.adresse);
    console.log("Coordonnées :", location.lat, location.lon);
    setSelectedLocation(location);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simulation de connexion (à remplacer par un appel API)
    const userData = {
      id: 1,
      nom: "Rakoto",
      prenom: "Jean",
      email: email,
      role: "paysan", // ou 'collecteur'
      location: selectedLocation, // Ajout de la localisation
    };

    login(JSON.stringify(userData));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            🌾 AgriConnect
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse
            </label>
            <LocationCombobox onSelectLocation={handleLocationSelect} />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;