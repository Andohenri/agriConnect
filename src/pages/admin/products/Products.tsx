/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardSkeleton } from "@/components/composant/ProductCard";
import { Search, Filter, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct } from "@/contexts/ProductContext";
import { ProductService } from "@/service/product.service";
import { Input } from "@/components/ui/input";

const AdminProduit = () => {
  const navigate = useNavigate();
  const { setIsEditing, setIsAdding, setProduct } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedStatus, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.getAllProducts();
      if (response?.data) {
        setProducts(response.data);
      } else {
        console.warn("Unexpected products response:", response);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter(product => product.statut === selectedStatus);
    }

    setFilteredProducts(filtered);
  };


  const handleEditProduct = (product: Product) => {
    setProduct(product);
    setIsEditing(true);
    setIsAdding(false);
    navigate('/admin/products/' + product.id);
  };

  const handleDeleteProduct = async (productId?: string) => {
    if (!productId) {
      console.warn("Product id is missing, cannot delete.");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await ProductService.deleteProduct(productId);
        await fetchProducts();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <section>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Gestion des Produits</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredProducts.length} produit(s) sur {products.length}
            </p>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher par nom, description ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="rupture">Rupture de stock</option>
              <option value="reserve">Réservé</option>
            </select>
          </div>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Afficher les skeletons pendant le chargement
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : filteredProducts.length === 0 ? (
            // Message si aucun produit
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedStatus !== "all"
                  ? "Aucun produit ne correspond aux filtres"
                  : "Aucun produit disponible"}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard
                  product={product}
                  userRole={undefined}
                  onEdit={() => handleEditProduct(product)}
                />
                
                {/* Bouton de suppression en overlay */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteProduct(product.id);
                  }}
                  aria-label={`Supprimer ${product.nom}`}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminProduit;