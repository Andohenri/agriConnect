import { useState } from 'react';
import { Star, MapPin, Calendar, Package, TrendingUp, Heart, MessageCircle, Phone, Mail, Edit, Settings, Shield, BarChart3, Clock, CheckCircle, XCircle, ChevronRight, User, Eye } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('apercu');
  const [isOwnProfile, setIsOwnProfile] = useState(true); // Toggle pour tester les deux vues
  
  const userProfile = {
    nom: "Rakoto",
    prenom: "Jean",
    email: "jean.rakoto@gmail.com",
    telephone: "034 12 345 67",
    localisation: "Analamanga",
    adresse: "Antananarivo, Madagascar",
    photo_profil: "👨‍🌾",
    role: "Paysan",
    bio: "Agriculteur passionné spécialisé en agriculture biologique",
    stats: {
      membre_depuis: "Jan 2024",
      transactions: 45,
      note: 4.8,
      taux_reussite: 96,
      total_ventes: "2.5T",
      revenus: "5.2M"
    }
  };

  const produits = [
    {
      id: 1,
      nom: "Riz Vary Gasy Premium",
      type: "grain",
      quantite: 500,
      unite: "kg",
      prix: 2500,
      image: "🌾",
      date: "2024-11-09",
      localisation: "Antananarivo",
      vues: 142,
      interesses: 24,
      status: "disponible"
    },
    {
      id: 2,
      nom: "Tomates Bio",
      type: "legume",
      quantite: 150,
      unite: "kg",
      prix: 3000,
      image: "🍅",
      date: "2024-11-06",
      localisation: "Analamanga",
      vues: 98,
      interesses: 18,
      status: "disponible"
    },
    {
      id: 3,
      nom: "Haricots Verts",
      type: "legume",
      quantite: 80,
      unite: "kg",
      prix: 4500,
      image: "🫘",
      date: "2024-11-04",
      localisation: "Antananarivo",
      vues: 203,
      interesses: 31,
      status: "vendu"
    },
    {
      id: 4,
      nom: "Maïs Jaune",
      type: "grain",
      quantite: 300,
      unite: "kg",
      prix: 2000,
      image: "🌽",
      date: "2024-11-08",
      localisation: "Antananarivo",
      vues: 167,
      interesses: 29,
      status: "disponible"
    }
  ];

  const transactions = [
    { id: 1, produit: "Riz Vary Gasy", quantite: 200, montant: 500000, acheteur: "Marie R.", date: "2024-11-08", statut: "complété" },
    { id: 2, produit: "Maïs", quantite: 100, montant: 180000, acheteur: "Paul R.", date: "2024-11-04", statut: "complété" },
    { id: 3, produit: "Tomates", quantite: 50, montant: 150000, acheteur: "Sophie M.", date: "2024-11-01", statut: "complété" }
  ];

  const activities = [
    { type: "produit", action: "Nouveau produit ajouté", details: "Riz Vary Gasy Premium", date: "Il y a 2 jours" },
    { type: "vente", action: "Vente réalisée", details: "200kg de Riz à Marie R.", date: "Il y a 3 jours" },
    { type: "produit", action: "Produit modifié", details: "Tomates Bio - Prix mis à jour", date: "Il y a 5 jours" },
    { type: "vente", action: "Vente réalisée", details: "100kg de Maïs à Paul R.", date: "Il y a 1 semaine" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Toggle pour tester les deux vues */}
        <div className="mb-6 flex justify-end">
          <button 
            onClick={() => setIsOwnProfile(!isOwnProfile)}
            className="text-xs bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
          >
            {isOwnProfile ? <User size={14} /> : <Eye size={14} />}
            {isOwnProfile ? "Voir en tant que visiteur" : "Voir mon profil"}
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-gray-100">
          <div className="relative">
            {/* Gradient Background */}
            <div className="h-32 md:h-40 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-6 md:px-10 pb-8">
              <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center text-6xl md:text-7xl border-4 border-white shadow-2xl">
                    {userProfile.photo_profil}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <Star size={20} fill="white" />
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="flex-1 pt-4 md:pt-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {userProfile.prenom} {userProfile.nom}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                          {userProfile.role}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 text-sm">
                          <MapPin size={16} className="text-green-600" />
                          {userProfile.localisation}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 text-sm">
                          <Calendar size={16} className="text-green-600" />
                          {userProfile.stats.membre_depuis}
                        </span>
                      </div>
                      <p className="text-gray-600 max-w-2xl">{userProfile.bio}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-fit">
                      {isOwnProfile ? (
                        <>
                          <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold">
                            <Edit size={18} />
                            Modifier
                          </button>
                          <button className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-semibold">
                            <Settings size={18} />
                            Paramètres
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold">
                            <MessageCircle size={18} />
                            Contacter
                          </button>
                          <button className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-semibold">
                            <Heart size={18} />
                            Suivre
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{produits.length}</div>
                      <div className="text-xs text-gray-500 font-medium">Produits actifs</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{userProfile.stats.transactions}</div>
                      <div className="text-xs text-gray-500 font-medium">Transactions</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent flex items-center justify-center md:justify-start gap-1">
                        {userProfile.stats.note}
                        <Star size={16} fill="#f59e0b" className="text-amber-500" />
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Note moyenne</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{userProfile.stats.taux_reussite}%</div>
                      <div className="text-xs text-gray-500 font-medium">Fiabilité</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'apercu', label: 'Aperçu', icon: BarChart3 },
            { id: 'produits', label: 'Produits', icon: Package },
            { id: 'transactions', label: 'Transactions', icon: TrendingUp },
            ...(isOwnProfile ? [{ id: 'activite', label: 'Activité', icon: Clock }] : []),
            { id: 'contact', label: 'Contact', icon: Phone }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white shadow-lg text-green-600 border-2 border-green-100'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-md border-2 border-transparent'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Aperçu Tab */}
            {activeTab === 'apercu' && (
              <>
                {isOwnProfile && (
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-2xl font-bold mb-6">📊 Vos performances ce mois-ci</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                        <div className="text-3xl font-bold mb-1">{userProfile.stats.total_ventes}</div>
                        <div className="text-sm text-green-100">Ventes totales</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                        <div className="text-3xl font-bold mb-1">{userProfile.stats.revenus} Ar</div>
                        <div className="text-sm text-green-100">Revenus générés</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                        <div className="text-3xl font-bold mb-1">+23%</div>
                        <div className="text-sm text-green-100">vs mois dernier</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                        <div className="text-3xl font-bold mb-1">12</div>
                        <div className="text-sm text-green-100">Nouveaux clients</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">🌾 Produits en vedette</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {produits.slice(0, 4).map(p => (
                      <div key={p.id} className="group border-2 border-gray-100 rounded-2xl p-4 hover:border-green-200 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                            {p.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm mb-1 truncate">{p.nom}</h4>
                            <p className="text-xs text-gray-500 mb-2">{p.quantite} {p.unite} disponibles</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-600">{p.prix.toLocaleString()} Ar</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                p.status === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {p.status === 'disponible' ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Produits Tab */}
            {activeTab === 'produits' && (
              <div className="space-y-4">
                {produits.map(p => (
                  <div key={p.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
                    <div className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center text-6xl flex-shrink-0 group-hover:scale-105 transition-transform">
                          {p.image}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{p.nom}</h3>
                              <p className="text-sm text-gray-500 capitalize">Type: {p.type}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                              p.status === 'disponible' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {p.status === 'disponible' ? '✓ Disponible' : '✗ Épuisé'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="text-xs text-gray-500 mb-1">Quantité</div>
                              <div className="font-bold">{p.quantite} {p.unite}</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                              <div className="text-xs text-gray-500 mb-1">Prix unitaire</div>
                              <div className="font-bold text-green-600">{p.prix.toLocaleString()} Ar</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="text-xs text-gray-500 mb-1">Vues</div>
                              <div className="font-bold flex items-center gap-1">
                                <Eye size={14} className="text-gray-400" />
                                {p.vues}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="text-xs text-gray-500 mb-1">Intéressés</div>
                              <div className="font-bold flex items-center gap-1">
                                <Heart size={14} className="text-red-400" />
                                {p.interesses}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin size={14} />
                              {p.localisation}
                            </span>
                            {isOwnProfile ? (
                              <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-semibold flex items-center gap-2">
                                <Edit size={14} />
                                Modifier
                              </button>
                            ) : (
                              <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-semibold">
                                Contacter le vendeur
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold mb-6">Historique des transactions</h3>
                <div className="space-y-3">
                  {transactions.map(t => (
                    <div key={t.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="text-green-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{t.produit}</h4>
                        <p className="text-sm text-gray-600">{isOwnProfile ? `Vendu à ${t.acheteur}` : `Acheté auprès de ${userProfile.prenom}`} · {t.quantite} kg</p>
                        <p className="text-xs text-gray-400 mt-1">{t.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{t.montant.toLocaleString()} Ar</div>
                        <span className="text-xs text-gray-500">{t.statut}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activité Tab (Own Profile Only) */}
            {activeTab === 'activite' && isOwnProfile && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold mb-6">Activité récente</h3>
                <div className="space-y-3">
                  {activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        a.type === 'produit' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {a.type === 'produit' ? <Package size={18} className="text-blue-600" /> : <TrendingUp size={18} className="text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{a.action}</p>
                        <p className="text-sm text-gray-600">{a.details}</p>
                        <p className="text-xs text-gray-400 mt-1">{a.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold mb-6">Informations de contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div className="font-semibold">{userProfile.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Téléphone</div>
                      <div className="font-semibold">{userProfile.telephone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MapPin className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Adresse</div>
                      <div className="font-semibold">{userProfile.adresse}</div>
                    </div>
                  </div>
                </div>
                
                {!isOwnProfile && (
                  <button className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-xl transition-all font-bold">
                    Envoyer un message
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Performance Card (Own Profile) */}
            {isOwnProfile && (
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={24} />
                  <h3 className="font-bold text-lg">Votre Score</h3>
                </div>
                <div className="text-5xl font-bold mb-2">{userProfile.stats.taux_reussite}%</div>
                <p className="text-blue-100 text-sm mb-4">Taux de fiabilité excellent</p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Livraisons à temps</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Satisfaction clients</span>
                    <span className="font-bold">4.8/5</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card (Visitor View) */}
            {!isOwnProfile && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Statistiques</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Note moyenne</span>
                    <span className="font-bold flex items-center gap-1">
                      <Star size={14} fill="#f59e0b" className="text-amber-500" />
                      {userProfile.stats.note}/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Transactions</span>
                    <span className="font-bold">{userProfile.stats.transactions}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Fiabilité</span>
                    <span className="font-bold text-green-600">{userProfile.stats.taux_reussite}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-bold">{userProfile.stats.membre_depuis}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions (Own Profile) */}
            {/* {isOwnProfile && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"></div>
                <h3 className="font-bold text-lg mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl transition"></button>
                    <Package className="text-green-600" size={20} />
                    <span className="font-semibold">Ajouter un nouveau produit</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                    <TrendingUp className="text-blue-600" size={20} />
                    <span className="font-semibold">Voir les performances</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition">
                    <Settings className="text-purple-600" size={20} />
                    <span className="font-semibold">Paramètres du compte</span>
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;