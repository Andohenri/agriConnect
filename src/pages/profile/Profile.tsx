import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import React, { useState } from "react";

const Profile = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const [userProfile, setUserProfile] = useState({
    nom: "Rakoto",
    prenom: "Jean",
    email: "jean.rakoto@gmail.com",
    telephone: "034 12 345 67",
    localisation: "Analamanga",
    adresse: "Antananarivo, Madagascar",
    photo_profil: "👨‍🌾",
  });
  return (
    <section>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Mon Profil</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">
                Informations Personnelles
              </h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={userProfile.prenom}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          prenom: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={userProfile.nom}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, nom: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={userProfile.telephone}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          telephone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={userProfile.localisation}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          localisation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Adresse complète
                    </label>
                    <input
                      type="text"
                      value={userProfile.adresse}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          adresse: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Sécurité</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
                >
                  Changer le mot de passe
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-32 h-32 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-6xl mx-auto mb-4">
                {userProfile.photo_profil}
              </div>
              <h3 className="font-bold text-xl mb-1">
                {userProfile.prenom} {userProfile.nom}
              </h3>
              <p className="text-gray-500 mb-4">
                {userRole === "farmer" ? "Paysan" : "Collecteur"}
              </p>
              <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold">
                Changer la photo
              </button>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <h4 className="font-bold mb-4">Statistiques</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-semibold">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Note moyenne</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star
                      size={14}
                      fill="#f59e0b"
                      className="text-yellow-500"
                    />
                    4.8/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux de réussite</span>
                  <span className="font-semibold text-green-600">96%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
