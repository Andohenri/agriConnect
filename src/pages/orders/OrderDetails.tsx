import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, Check, DollarSign, MapPin, MessageSquare, Package, Phone, X } from 'lucide-react'
import React from 'react'

const OrderDetails = () => {
  const {user} = useAuth();
  const userRole = user?.role; // 'farmer' or 'collector'
  const orders = [
    { id: 1, produit: 'Riz Premium', quantite_commandee: 100, statut: 'en_attente', collecteur: 'Société AgriTrade', paysan: 'Jean Rakoto', prix_total: 250000, date_commande: '2025-11-03', date_livraison_prevue: '2025-11-10', adresse_livraison: 'Antananarivo, Analamanga', mode_livraison: 'livraison', message_collecteur: 'Besoin urgent pour exportation' },
    { id: 2, produit: 'Maïs Bio', quantite_commandee: 50, statut: 'acceptee', collecteur: 'CoopéGrain', paysan: 'Marie Rasoa', prix_total: 90000, date_commande: '2025-11-02', date_livraison_prevue: '2025-11-08', adresse_livraison: 'Antsirabe, Vakinankaratra', mode_livraison: 'sur_place' },
    { id: 3, produit: 'Haricots Secs', quantite_commandee: 75, statut: 'en_livraison', collecteur: 'AgriTrade SA', paysan: 'Paul Randria', prix_total: 240000, date_commande: '2025-11-01', date_livraison_prevue: '2025-11-06', adresse_livraison: 'Antananarivo', mode_livraison: 'livraison' },
  ];
  const order = orders[0]; // Exemple : afficher la première commande
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Détails de la Commande #{order.id}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Statut de la commande */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Statut de la Commande</h3>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                  order.statut === 'acceptee' ? 'bg-green-100 text-green-700' :
                    order.statut === 'en_livraison' ? 'bg-blue-100 text-blue-700' :
                      order.statut === 'livree' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                }`}>
                {order.statut === 'en_attente' ? '⏳ En attente' :
                  order.statut === 'acceptee' ? '✅ Acceptée' :
                    order.statut === 'en_livraison' ? '🚚 En livraison' :
                      order.statut === 'livree' ? '✓ Livrée' : '❌ Refusée'}
              </span>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                <div className="relative flex gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold z-10">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">Commande passée</p>
                    <p className="text-sm text-gray-500">{order.date_commande}</p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className={`w-8 h-8 ${order.statut !== 'en_attente' ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold z-10`}>
                    {order.statut !== 'en_attente' ? '✓' : '2'}
                  </div>
                  <div>
                    <p className="font-semibold">Commande acceptée</p>
                    <p className="text-sm text-gray-500">
                      {order.statut !== 'en_attente' ? 'Confirmée' : 'En attente de confirmation'}
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className={`w-8 h-8 ${order.statut === 'en_livraison' || order.statut === 'livree' ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold z-10`}>
                    {order.statut === 'en_livraison' || order.statut === 'livree' ? '✓' : '3'}
                  </div>
                  <div>
                    <p className="font-semibold">En cours de livraison</p>
                    <p className="text-sm text-gray-500">
                      Prévu le {order.date_livraison_prevue}
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className={`w-8 h-8 ${order.statut === 'livree' ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white font-bold z-10`}>
                    {order.statut === 'livree' ? '✓' : '4'}
                  </div>
                  <div>
                    <p className="font-semibold">Commande livrée</p>
                    <p className="text-sm text-gray-500">
                      {order.statut === 'livree' ? 'Livraison effectuée' : 'En attente'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails du produit */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Détails du Produit</h3>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-5xl">📦</div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">{order.produit}</h4>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Quantité</p>
                    <p className="font-semibold">{order.quantite_commandee} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prix Total</p>
                    <p className="font-semibold text-green-600">{order.prix_total.toLocaleString()} Ar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de livraison */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Informations de Livraison</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="text-green-600 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-semibold">{order.adresse_livraison}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-green-600 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Date prévue</p>
                  <p className="font-semibold">{order.date_livraison_prevue}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="text-green-600 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Mode de livraison</p>
                  <p className="font-semibold">
                    {order.mode_livraison === 'livraison' ? '🚚 Livraison à domicile' :
                      order.mode_livraison === 'sur_place' ? '🏪 Retrait sur place' : '📋 À convenir'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {order.message_collecteur && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <h4 className="font-bold mb-2">💬 Message du collecteur</h4>
              <p className="text-gray-700">{order.message_collecteur}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations contact */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="font-bold text-lg mb-4">
              {userRole === 'farmer' ? 'Collecteur' : 'Producteur'}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-linear -to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-3xl">
                  {userRole === 'farmer' ? '🏢' : '👨‍🌾'}
                </div>
                <div>
                  <p className="font-bold">{userRole === 'farmer' ? order.collecteur : order.paysan}</p>
                  <p className="text-sm text-gray-500">
                    {userRole === 'farmer' ? 'Entreprise' : 'Producteur'}
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition font-semibold">
                  <Phone size={18} />
                  Appeler
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-semibold">
                  <MessageSquare size={18} />
                  Envoyer un message
                </button>
              </div>
            </div>
          </div>

          {/* Actions selon le rôle et le statut */}
          {userRole === 'farmer' && order.statut === 'en_attente' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
              <h4 className="font-bold text-lg mb-4">Actions</h4>
              <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                <Check size={20} />
                Accepter la commande
              </button>
              <button className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold">
                <X size={20} />
                Refuser
              </button>
            </div>
          )}

          {order.statut === 'acceptee' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
              <h4 className="font-bold text-lg mb-4">Actions</h4>
              {userRole === 'farmer' && (
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold">
                  <Package size={20} />
                  Marquer comme expédiée
                </button>
              )}
              {userRole === 'collector' && (
                <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                  <DollarSign size={20} />
                  Effectuer le paiement
                </button>
              )}
            </div>
          )}

          {/* Résumé financier */}
          <div className="bg-linear -to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
            <h4 className="font-bold mb-4">Résumé Financier</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">{order.prix_total.toLocaleString()} Ar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-semibold">5,000 Ar</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-green-300">
                <span className="font-bold">Total</span>
                <span className="font-bold text-green-600 text-xl">
                  {(order.prix_total + 5000).toLocaleString()} Ar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails