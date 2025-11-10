import { Ban, CheckCircle, Edit, Plus, Trash2 } from "lucide-react";

// Exemple de données utilisateurs
const usersData = [
  {
    id: 1,
    name: "Jean Rakoto",
    email: "jean.rakoto@example.com",
    role: "Paysan",
    active: true,
    avatar: "👨‍🌾",
  },
  {
    id: 2,
    name: "Marie Rasoa",
    email: "marie.rasoa@example.com",
    role: "Collecteur",
    active: true,
    avatar: "👩‍🌾",
  },
  {
    id: 3,
    name: "Admin",
    email: "admin@example.com",
    role: "Admin",
    active: true,
    avatar: "🛡️",
  },
];

const Users = () => {
  // Ici tu peux récupérer les utilisateurs depuis ton backend via useState + useEffect
  const users = usersData;

  return (
    <section>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Gestion des Utilisateurs</h2>
          <button className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition">
            <Plus size={20} />
            Ajouter un utilisateur
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-2xl md:text-3xl shrink-0">
                  {user.avatar || "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold">{user.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Rôle : <span className="font-semibold">{user.role}</span>
                  </p>
                </div>
                <span
                  className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                    user.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.active ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2">
                  <Edit size={16} /> Modifier
                </button>

                <button className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2">
                  <Trash2 size={16} /> Supprimer
                </button>

                <button
                  className={`${
                    user.active ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"
                  } text-white px-3 py-2 rounded-lg transition text-sm flex items-center gap-2`}
                >
                  {user.active ? (
                    <>
                      <Ban size={16} /> Désactiver
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Activer
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Users;
