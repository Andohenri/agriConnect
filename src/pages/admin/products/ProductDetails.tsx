/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Edit,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  ShoppingCart,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/types/enums";


interface ProductProps {
  id: number;
  nom: string;
  type: string;
  sous_type: string;
  quantite_disponible: number;
  unite: string;
  prix_unitaire: number;
  date_recolte: string;
  image: string;
  localisation: string;
  latitude: number;
  longitude: number;
  paysan: string;
  telephone: string;
  description: string;
  certification: string;
  statut: string;
}

const AdminProductDetail = ({ product }: { product: ProductProps }) => {
  const { user } = useAuth();
  const userRole = user?.role;
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  return (
    <section>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Détails du Produit</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images et infos principales */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-9xl">
                {product.image}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{product.nom}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {product.statut === "disponible"
                          ? "✓ Disponible"
                          : "Rupture"}
                      </span>
                      {product.certification && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          🏆 {product.certification}
                        </span>
                      )}
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {product.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-green-600">
                      {product.prix_unitaire.toLocaleString()} Ar
                    </p>
                    <p className="text-gray-500">par {product.unite}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-bold text-lg mb-3">Description</h4>
                  <p className="text-gray-700">{product.description}</p>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <Package className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          Quantité disponible
                        </p>
                        <p className="font-bold">
                          {product.quantite_disponible} {product.unite}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Date de récolte</p>
                        <p className="font-bold">{product.date_recolte}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Localisation</p>
                        <p className="font-bold">{product.localisation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-bold">
                          {product.sous_type || "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Informations vendeur et actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-bold text-lg mb-4">
                Informations du Producteur
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-3xl">
                    👨‍🌾
                  </div>
                  <div>
                    <p className="font-bold">{product.paysan}</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} />
                      <span className="text-xs text-gray-500 ml-1">(4.2)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span className="text-sm">{product.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{product.localisation}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  {userRole === Role.COLLECTEUR && (
                    <>
                      <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                        <ShoppingCart size={20} />
                        Commander
                      </button>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold">
                        <MessageSquare size={20} />
                        Contacter
                      </button>
                    </>
                  )}
                  {true && (
                    <>
                      <button
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold"
                      >
                        <Edit size={20} />
                        Modifier
                      </button>
                      <button className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold">
                        <Trash2 size={20} />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <h4 className="font-bold mb-3">💡 Informations utiles</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Produit vérifié</li>
                <li>✓ Paiement sécurisé</li>
                <li>✓ Livraison disponible</li>
                <li>✓ Support 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminProductDetail;
