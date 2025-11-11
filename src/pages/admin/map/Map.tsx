// import { MessageSquare, Package, Phone, User, Map } from "lucide-react";
// import { MessageSquare, Phone } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const MapView = () => {
  const products = [
    {
      id: 1,
      name: "Riz Premium",
      type: "Grain",
      quantity: 500,
      unit: "kg",
      price: 2500,
      date: "2025-01-15",
      image: "🌾",
      location: "Analamanga",
      lat: -18.8792,
      lng: 47.5079,
      farmer: "Jean Rakoto",
      phone: "034 12 345 67",
    },
    {
      id: 2,
      name: "Maïs Bio",
      type: "Grain",
      quantity: 300,
      unit: "kg",
      price: 1800,
      date: "2025-01-20",
      image: "🌽",
      location: "Vakinankaratra",
      lat: -19.4,
      lng: 46.95,
      farmer: "Marie Rasoa",
      phone: "033 98 765 43",
    },
    {
      id: 3,
      name: "Haricots Secs",
      type: "Légumineuse",
      quantity: 200,
      unit: "kg",
      price: 3200,
      date: "2025-01-18",
      image: "🫘",
      location: "Analamanga",
      lat: -18.95,
      lng: 47.52,
      farmer: "Paul Randria",
      phone: "032 55 444 33",
    },
  ];

  const navigate = useNavigate();
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  const createEmojiIcon = (emoji: string) =>
    L.divIcon({
      html: `<div style="
        font-size: 28px;
        background: white;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #16a34a;
        box-shadow: 0 0 6px rgba(0,0,0,0.2);
      ">${emoji}</div>`,
      className: "", // pour éviter le style par défaut
      iconSize: [45, 45],
      iconAnchor: [22, 45],
      popupAnchor: [0, -40],
    });
  return (
    <div className="bg-white shadow-lg overflow-hidden mt-16 z-10">
      <MapContainer
        center={[-18.8792, 47.5079]}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full min-h-[calc(100vh-64px)] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {products.map((product, index) => (
          <Marker
            key={product.id}
            position={[product.lat, product.lng]}
            icon={createEmojiIcon(product.image)}
            ref={(ref) => {
              markerRefs.current[index] = ref;
            }}
            eventHandlers={{
              mouseover: () => markerRefs.current[index]?.openPopup(),
              // mouseout supprimé
            }}
          >
            <Popup closeButton={true} closeOnClick={false}>
              <div className="space-y-2">
                <p className="font-bold text-lg">{product.name}</p>
                <p className="text-sm text-gray-600">{product.type}</p>
                <p className="text-green-600 font-semibold">
                  {product.quantity} {product.unit} —{" "}
                  {product.price.toLocaleString()} Ar
                </p>
                <p className="text-sm text-gray-500">📍 {product.location}</p>
                <p className="text-sm">👨‍🌾 {product.farmer}</p>
                <p className="text-sm">📞 {product.phone}</p>
                <p className="text-xs text-gray-400">🗓️ {product.date}</p>

                {/* Boutons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => alert(`Appeler ${product.farmer}`)}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    📞 Appeler
                  </button>
                  <button
                    onClick={() => alert(`Message à ${product.farmer}`)}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    ✉️ Message
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${product.id}`)}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    👤 Voir Profil
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;








/* eslint-disable react-hooks/exhaustive-deps */
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import { useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { ProductService } from "@/service/product.service";
// import { Role, ProductStatut } from "@/types/enums";
// import { PRODUCT_TYPE_ICONS } from "@/lib/utils";
// import { toast } from "sonner";
// import { Phone, MessageSquare, User, ShoppingCart, Eye, Loader2 } from "lucide-react";

// const MapView = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const markerRefs = useRef<(L.Marker | null)[]>([]);
  
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     setIsLoading(true);
//     try {
//       const data = await ProductService.getAllProducts();
//       // Filtrer uniquement les produits disponibles avec localisation
//       const availableProducts = data.filter(
//         (product) => 
//           product.statut === ProductStatut.DISPONIBLE && 
//           product.localisation?.latitude && 
//           product.localisation?.longitude
//       );
//       setProducts(availableProducts);
//     } catch (error) {
//       console.error("Erreur lors du chargement des produits:", error);
//       toast.error("Erreur lors du chargement de la carte");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createEmojiIcon = (emoji: string) =>
//     L.divIcon({
//       html: `<div style="
//         font-size: 28px;
//         background: white;
//         border-radius: 50%;
//         width: 45px;
//         height: 45px;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         border: 2px solid #16a34a;
//         box-shadow: 0 0 6px rgba(0,0,0,0.2);
//       ">${emoji}</div>`,
//       className: "",
//       iconSize: [45, 45],
//       iconAnchor: [22, 45],
//       popupAnchor: [0, -40],
//     });

//   const handleCall = (phone?: string, farmerName?: string) => {
//     if (phone) {
//       window.location.href = `tel:${phone}`;
//     } else {
//       toast.error("Numéro de téléphone non disponible");
//     }
//   };

//   const handleMessage = (email?: string, farmerName?: string) => {
//     if (email) {
//       window.location.href = `mailto:${email}`;
//     } else {
//       toast.info("Fonctionnalité de messagerie à venir");
//     }
//   };

//   const handleViewProfile = (farmerId?: string) => {
//     if (farmerId) {
//       navigate(`/farmers/${farmerId}`);
//     } else {
//       toast.error("Profil non disponible");
//     }
//   };

//   const handleViewProduct = (productId?: string) => {
//     if (productId) {
//       navigate(`/products/${productId}`);
//     }
//   };

//   const handleCommand = (productId?: string) => {
//     if (productId) {
//       // Logique de commande
//       toast.info("Fonctionnalité de commande à venir");
//     }
//   };

//   // Centre de la carte sur Madagascar
//   const defaultCenter: [number, number] = [-18.8792, 47.5079];

//   return (
//     <div className="bg-white shadow-lg overflow-hidden mt-16 z-10 relative">
//       {isLoading && (
//         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
//           <Loader2 className="animate-spin" size={20} />
//           <span className="text-sm font-medium">Chargement des produits...</span>
//         </div>
//       )}

//       <MapContainer
//         center={defaultCenter}
//         zoom={7}
//         scrollWheelZoom={true}
//         className="w-full min-h-[calc(100vh-64px)] z-0"
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {products.map((product, index) => {
//           const lat = product.localisation?.latitude;
//           const lng = product.localisation?.longitude;
          
//           if (!lat || !lng) return null;

//           const emoji = product.imageUrl || PRODUCT_TYPE_ICONS[product.type] || "📦";
//           const farmerName = product.paysan?.nom && product.paysan?.prenom 
//             ? `${product.paysan.nom} ${product.paysan.prenom}`
//             : "Producteur";

//           return (
//             <Marker
//               key={product.id}
//               position={[lat, lng]}
//               icon={createEmojiIcon(emoji)}
//               ref={(ref) => {
//                 markerRefs.current[index] = ref;
//               }}
//               eventHandlers={{
//                 mouseover: () => markerRefs.current[index]?.openPopup(),
//               }}
//             >
//               <Popup closeButton={true} closeOnClick={false} className="custom-popup">
//                 <div className="space-y-2 min-w-[250px]">
//                   <p className="font-bold text-lg text-green-700">{product.nom}</p>
//                   <p className="text-sm text-gray-600">{product.type}</p>
                  
//                   <div className="bg-green-50 p-2 rounded">
//                     <p className="text-green-600 font-semibold">
//                       {product.quantiteDisponible} {product.unite} — {product.prixUnitaire?.toLocaleString()} Ar
//                     </p>
//                   </div>

//                   <p className="text-sm text-gray-500">
//                     📍 {product.localisation?.adresse || "Localisation"}
//                   </p>
                  
//                   <p className="text-sm">
//                     👨‍🌾 {farmerName}
//                   </p>
                  
//                   {product.paysan?.telephone && (
//                     <p className="text-sm">📞 {product.paysan.telephone}</p>
//                   )}
                  
//                   {product.dateRecolte && (
//                     <p className="text-xs text-gray-400">
//                       🗓️ Récolté le {new Date(product.dateRecolte).toLocaleDateString()}
//                     </p>
//                   )}

//                   {/* Boutons d'action */}
//                   <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
//                     {/* Voir le produit - accessible à tous */}
//                     <button
//                       onClick={() => handleViewProduct(product.id)}
//                       className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-blue-200 transition flex items-center gap-1"
//                     >
//                       <Eye size={14} />
//                       Voir détails
//                     </button>

//                     {/* Actions pour les collecteurs */}
//                     {user?.role === Role.COLLECTEUR && (
//                       <>
//                         <button
//                           onClick={() => handleCommand(product.id)}
//                           className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-green-200 transition flex items-center gap-1"
//                         >
//                           <ShoppingCart size={14} />
//                           Commander
//                         </button>
                        
//                         {product.paysan?.telephone && (
//                           <button
//                             onClick={() => handleCall(product.paysan?.telephone, farmerName)}
//                             className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-orange-200 transition flex items-center gap-1"
//                           >
//                             <Phone size={14} />
//                             Appeler
//                           </button>
//                         )}
                        
//                         <button
//                           onClick={() => handleMessage(product.paysan?.email, farmerName)}
//                           className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-purple-200 transition flex items-center gap-1"
//                         >
//                           <MessageSquare size={14} />
//                           Message
//                         </button>
//                       </>
//                     )}

//                     {/* Voir profil - accessible à tous */}
//                     {product.paysan?.id && (
//                       <button
//                         onClick={() => handleViewProfile(product.paysan?.id)}
//                         className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-200 transition flex items-center gap-1"
//                       >
//                         <User size={14} />
//                         Profil
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>

//       {/* Légende */}
//       <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
//         <h3 className="font-bold text-sm mb-2">Légende</h3>
//         <div className="space-y-1 text-xs">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded-full bg-green-500"></div>
//             <span>Produits disponibles</span>
//           </div>
//           <p className="text-gray-500 mt-2">
//             Total: <span className="font-bold">{products.length}</span> produit(s)
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapView;