import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";

const AddProduct = () => {
  const [productForm, setProductForm] = useState({
    nom: "",
    type: "grain",
    sous_type: "",
    description: "",
    quantite_disponible: "",
    unite: "kg",
    prix_unitaire: "",
    date_recolte: "",
    certification: "",
    image: null,
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <section>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsAddingProduct(false);
              setEditingProduct(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">
            {editingProduct
              ? "Modifier le Produit"
              : "Ajouter un Nouveau Produit"}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  value={productForm.nom}
                  onChange={(e) =>
                    setProductForm({ ...productForm, nom: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Riz Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Type *
                </label>
                <select
                  value={productForm.type}
                  onChange={(e) =>
                    setProductForm({ ...productForm, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="grain">Grain</option>
                  <option value="legumineuse">Légumineuse</option>
                  <option value="tubercule">Tubercule</option>
                  <option value="fruit">Fruit</option>
                  <option value="legume">Légume</option>
                  <option value="epice">Épice</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Sous-type
                </label>
                <input
                  type="text"
                  value={productForm.sous_type}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      sous_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Bio, Frais, Sec"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Certification
                </label>
                <input
                  type="text"
                  value={productForm.certification}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      certification: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Bio, AOP"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Quantité Disponible *
                </label>
                <input
                  type="number"
                  value={productForm.quantite_disponible}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      quantite_disponible: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Unité *
                </label>
                <select
                  value={productForm.unite}
                  onChange={(e) =>
                    setProductForm({ ...productForm, unite: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="tonne">Tonne</option>
                  <option value="sac">Sac</option>
                  <option value="litre">Litre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Prix Unitaire (Ar) *
                </label>
                <input
                  type="number"
                  value={productForm.prix_unitaire}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      prix_unitaire: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 2500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Date de Récolte *
                </label>
                <input
                  type="date"
                  value={productForm.date_recolte}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      date_recolte: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Décrivez votre produit en détail..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Image du Produit
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition cursor-pointer">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-gray-600 mb-2">
                  Cliquez pour télécharger une image
                </p>
                <p className="text-xs text-gray-400">PNG, JPG jusqu'à 5MB</p>
                <input type="file" className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold"
              >
                {editingProduct ? "Mettre à jour" : "Ajouter le produit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddProduct;
