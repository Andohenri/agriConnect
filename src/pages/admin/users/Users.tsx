/* eslint-disable react-hooks/exhaustive-deps */
import { Ban, CheckCircle, Edit, Plus, Trash2, Search, Filter, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/service/user.service";
import { Role, Statut } from "@/types/enums";

// Mapping des avatars par rôle
const ROLE_AVATARS = {
  [Role.PAYSAN]: "👨‍🌾",
  [Role.COLLECTEUR]: "🚚",
  [Role.ADMIN]: "🛡️",
};

const ROLE_LABELS = {
  [Role.PAYSAN]: "Paysan",
  [Role.COLLECTEUR]: "Collecteur",
  [Role.ADMIN]: "Administrateur",
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, selectedStatus, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par rôle
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter((user) => user.statut === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;

    // Déterminer le nouveau statut
    let newStatus: string;
    let action: string;
    
    if (user.statut === Statut.ACTIF) {
      newStatus = Statut.SUSPENDU;
      action = "suspendre";
    } else {
      newStatus = Statut.ACTIF;
      action = "activer";
    }
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.nom} ${user.prenom} ?`
    );

    if (!confirmed) return;

    try {
      await UserService.updateUserStatus(user.id, newStatus as Statut);
      toast.success(
        `Utilisateur ${newStatus === Statut.ACTIF ? "activé" : "suspendu"} avec succès`
      );
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Erreur lors du changement de statut");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.nom} ${user.prenom} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      await UserService.deleteUser(user.id);
      toast.success("Utilisateur supprimé avec succès");
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleAddUser = () => {
    // Navigation vers le formulaire d'ajout
    toast.info("Fonctionnalité à venir");
  };

  const handleEditUser = (user: User) => {
    // Navigation vers le formulaire d'édition
    console.log("Éditer l'utilisateur:", user);
    toast.info("Fonctionnalité à venir");
  };

  return (
    <section>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Gestion des Utilisateurs
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredUsers.length} utilisateur(s) sur {users.length}
            </p>
          </div>
          <Button
            onClick={handleAddUser}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Filtres et Recherche */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">Tous les rôles</option>
              <option value={Role.PAYSAN}>Paysans</option>
              <option value={Role.COLLECTEUR}>Collecteurs</option>
              <option value={Role.ADMIN}>Administrateurs</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
              <option value="suspendu">Suspendus</option>
            </select>
          </div>
        </div>

        {/* Grille d'utilisateurs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            // Skeletons pendant le chargement
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 md:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            // Message si aucun utilisateur
            <div className="col-span-full text-center py-12">
              <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                  ? "Aucun utilisateur ne correspond aux filtres"
                  : "Aucun utilisateur disponible"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="p-4 md:p-6 hover:shadow-md transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-2xl md:text-3xl shrink-0">
                    {ROLE_AVATARS[user.role] || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold truncate">
                      {user.nom} {user.prenom}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      <span className="font-semibold">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant={user.statut === Statut.ACTIF ? "default" : user.statut === Statut.SUSPENDU ? "secondary" : "outline"}
                    className={
                      user.statut === Statut.ACTIF
                        ? "bg-green-100 text-green-700"
                        : user.statut === Statut.SUSPENDU
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {user.statut === Statut.ACTIF ? "Actif" : user.statut === Statut.SUSPENDU ? "Suspendu" : "Inactif"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleEditUser(user)}
                    size="sm"
                    variant="secondary"
                    className="flex-1 min-w-[100px]"
                  >
                    <Edit size={16} />
                    Modifier
                  </Button>

                  <Button
                    onClick={() => handleDeleteUser(user)}
                    size="sm"
                    variant="destructive"
                    className="flex-1 min-w-[100px]"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </Button>

                  <Button
                    onClick={() => handleToggleStatus(user)}
                    size="sm"
                    variant="outline"
                    className={`flex-1 min-w-[120px] ${
                      user.statut === Statut.ACTIF
                        ? "text-orange-600 border-orange-600 hover:bg-orange-50"
                        : "text-green-600 border-green-600 hover:bg-green-50"
                    }`}
                  >
                    {user.statut === Statut.ACTIF ? (
                      <>
                        <Ban size={16} />
                        Suspendre
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Activer
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminUsers;