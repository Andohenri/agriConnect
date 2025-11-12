/* eslint-disable react-hooks/exhaustive-deps */
import {
  Ban,
  CheckCircle,
  Edit,
  Plus,
  Trash2,
  Search,
  Filter,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Eye,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserService } from "@/service/user.service";
import { Role, Statut } from "@/types/enums";

// Mapping des avatars par rôle
const ROLE_CONFIG = {
  [Role.PAYSAN]: {
    avatar: "👨‍🌾",
    label: "Paysan",
    color: "bg-green-100 text-green-700 border-green-200",
    bgGradient: "from-green-50 to-green-100",
  },
  [Role.COLLECTEUR]: {
    avatar: "🚚",
    label: "Collecteur",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    bgGradient: "from-blue-50 to-blue-100",
  },
  [Role.ADMIN]: {
    avatar: "🛡️",
    label: "Administrateur",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    bgGradient: "from-purple-50 to-purple-100",
  },
};

const STATUT_CONFIG = {
  [Statut.ACTIF]: {
    label: "Actif",
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
  },
  [Statut.SUSPENDU]: {
    label: "Suspendu",
    color: "bg-orange-100 text-orange-700",
    dotColor: "bg-orange-500",
  },
  [Statut.INACTIF]: {
    label: "Inactif",
    color: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-500",
  },
};

type ViewMode = "grid" | "table";

const ModernAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    suspendus: 0,
    paysans: 0,
    collecteurs: 0,
    admins: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    calculateStats();
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

  const calculateStats = () => {
    setStats({
      total: users.length,
      actifs: users.filter((u) => u.statut === Statut.ACTIF).length,
      suspendus: users.filter((u) => u.statut === Statut.SUSPENDU).length,
      paysans: users.filter((u) => u.role === Role.PAYSAN).length,
      collecteurs: users.filter((u) => u.role === Role.COLLECTEUR).length,
      admins: users.filter((u) => u.role === Role.ADMIN).length,
    });
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telephone?.includes(searchTerm)
      );
    }
    
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter((user) => user.statut === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;

    const newStatus =
      user.statut === Statut.ACTIF ? Statut.SUSPENDU : Statut.ACTIF;
    const action = newStatus === Statut.ACTIF ? "activer" : "suspendre";

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.nom} ${user.prenom} ?`
    );

    if (!confirmed) return;

    try {
      await UserService.updateUserStatus(user.id, newStatus);
      toast.success(
        `Utilisateur ${
          newStatus === Statut.ACTIF ? "activé" : "suspendu"
        } avec succès`
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

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleExportData = () => {
    const csvData = filteredUsers
      .map((u) => {
        return [
          u.nom,
          u.prenom,
          u.email,
          u.telephone || "",
          ROLE_CONFIG[u.role]?.label,
          STATUT_CONFIG[u.statut]?.label,
          u.adresse || "",
        ].join(",");
      })
      .join("\n");

    const header = "Nom,Prénom,Email,Téléphone,Rôle,Statut,Adresse\n";
    const csv = header + csvData;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateurs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Données exportées avec succès");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
  };

  return (
    <section className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Gestion des Utilisateurs
            </h2>
            <p className="text-sm text-gray-600">
              Gérez et suivez tous les utilisateurs de la plateforme
            </p>
          </div>

          {/* Statistiques rapides */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="flex items-center gap-2">
                <Users className="text-gray-600" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="flex items-center gap-2">
                <UserCheck className="text-green-600" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Actifs</p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.actifs}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <div className="flex items-center gap-2">
                <UserX className="text-orange-600" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Suspendus</p>
                  <p className="text-lg font-bold text-orange-600">
                    {stats.suspendus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tous les rôles</option>
                <option value={Role.PAYSAN}>👨‍🌾 Paysans</option>
                <option value={Role.COLLECTEUR}>🚚 Collecteurs</option>
                <option value={Role.ADMIN}>🛡️ Admins</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tous les statuts</option>
                <option value={Statut.ACTIF}>✅ Actifs</option>
                <option value={Statut.SUSPENDU}>⏸️ Suspendus</option>
                <option value={Statut.INACTIF}>❌ Inactifs</option>
              </select>
            </div>

            {(searchTerm || selectedRole !== "all" || selectedStatus !== "all") && (
              <Button
                onClick={handleResetFilters}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <X size={16} className="mr-1" />
                Réinitialiser
              </Button>
            )}

            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              <Download size={16} className="mr-1" />
              Exporter
            </Button>

            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              <RefreshCw size={16} className="mr-1" />
              Actualiser
            </Button>

            <Button
              onClick={() => toast.info("Fonctionnalité à venir")}
              className="bg-green-600 hover:bg-green-700 text-sm"
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>

        {/* Indicateur de résultats */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredUsers.length} utilisateur(s) affiché(s) sur {users.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs">👨‍🌾 {stats.paysans} paysans</span>
            <span className="text-xs">🚚 {stats.collecteurs} collecteurs</span>
            <span className="text-xs">🛡️ {stats.admins} admins</span>
          </div>
        </div>
      </Card>

      {/* Grille d'utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
            </Card>
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12">
              <div className="text-center">
                <UserIcon size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  selectedRole !== "all" ||
                  selectedStatus !== "all"
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Aucun utilisateur n'est enregistré dans le système"}
                </p>
                {(searchTerm ||
                  selectedRole !== "all" ||
                  selectedStatus !== "all") && (
                  <Button onClick={handleResetFilters} variant="outline">
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const roleConfig = ROLE_CONFIG[user.role];
            const statutConfig = STATUT_CONFIG[user.statut];

            return (
              <Card
                key={user.id}
                className="p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                {/* Bordure colorée selon le rôle */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    user.role === Role.PAYSAN
                      ? "from-green-400 to-green-600"
                      : user.role === Role.COLLECTEUR
                      ? "from-blue-400 to-blue-600"
                      : "from-purple-400 to-purple-600"
                  }`}
                />

                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar avec gradient */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0 bg-gradient-to-br ${roleConfig?.bgGradient} border-2 ${roleConfig?.color.split(" ")[2]}`}
                  >
                    {roleConfig?.avatar || "👤"}
                  </div>

                  {/* Infos principales */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {user.nom} {user.prenom}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye size={16} className="mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.info("Fonctionnalité à venir")
                            }
                          >
                            <Edit size={16} className="mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                            className={
                              user.statut === Statut.ACTIF
                                ? "text-orange-600"
                                : "text-green-600"
                            }
                          >
                            {user.statut === Statut.ACTIF ? (
                              <>
                                <Ban size={16} className="mr-2" />
                                Suspendre
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} className="mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${roleConfig?.color} text-xs`}>
                        {roleConfig?.label}
                      </Badge>
                      <Badge className={`${statutConfig?.color} text-xs flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statutConfig?.dotColor} animate-pulse`}></span>
                        {statutConfig?.label}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      {user.email && (
                        <div className="flex items-center gap-1 truncate">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user.telephone && (
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="shrink-0" />
                          <span>{user.telephone}</span>
                        </div>
                      )}
                      {user.adresse && (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{user.adresse}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleViewDetails(user)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Eye size={14} className="mr-1" />
                    Détails
                  </Button>
                  <Button
                    onClick={() => toast.info("Fonctionnalité à venir")}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Edit size={14} className="mr-1" />
                    Modifier
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de détails */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${
                  selectedUser
                    ? ROLE_CONFIG[selectedUser.role]?.bgGradient
                    : ""
                }`}
              >
                {selectedUser ? ROLE_CONFIG[selectedUser.role]?.avatar : "👤"}
              </div>
              <div>
                <p className="text-xl font-bold">
                  {selectedUser?.nom} {selectedUser?.prenom}
                </p>
                <p className="text-sm text-gray-500 font-normal">
                  {selectedUser
                    ? ROLE_CONFIG[selectedUser.role]?.label
                    : ""}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Informations détaillées sur l'utilisateur
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Statut
                  </label>
                  <Badge
                    className={`mt-1 ${
                      STATUT_CONFIG[selectedUser.statut]?.color
                    }`}
                  >
                    {STATUT_CONFIG[selectedUser.statut]?.label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Rôle
                  </label>
                  <Badge
                    className={`mt-1 ${
                      ROLE_CONFIG[selectedUser.role]?.color
                    }`}
                  >
                    {ROLE_CONFIG[selectedUser.role]?.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">
                      {selectedUser.email || "Non renseigné"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-gray-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium">
                      {selectedUser.telephone || "Non renseigné"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="text-sm font-medium">
                      {selectedUser.adresse || "Non renseignée"}
                    </p>
                  </div>
                </div>

                {selectedUser.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">
                        Date d'inscription
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsDetailDialogOpen(false)}
              variant="outline"
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  handleToggleStatus(selectedUser);
                  setIsDetailDialogOpen(false);
                }
              }}
              variant={
                selectedUser?.statut === Statut.ACTIF ? "outline" : "default"
              }
              className={
                selectedUser?.statut === Statut.ACTIF
                  ? "text-orange-600 border-orange-600 hover:bg-orange-50"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {selectedUser?.statut === Statut.ACTIF ? (
                <>
                  <Ban size={16} className="mr-2" />
                  Suspendre
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Activer
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                toast.info("Fonctionnalité à venir");
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit size={16} className="mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ModernAdminUsers;