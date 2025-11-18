/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/composant/ProductCard";
import { Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct } from "@/contexts/ProductContext";
import { ProductService } from "@/service/product.service";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminProduit = () => {
  const navigate = useNavigate();
  const { setIsEditing, setIsAdding, setProduct } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(12); // Nombre de produits par page

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedStatus, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.getAllProducts(currentPage, limit);
      if (response?.data) {
        setProducts(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalProducts(response.total || 0);
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
      filtered = filtered.filter(
        (product) =>
          product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (product) => product.statut === selectedStatus
      );
    }

    setFilteredProducts(filtered);
  };

  const handleEditProduct = (product: Product) => {
    setProduct(product);
    setIsEditing(true);
    setIsAdding(false);
    navigate("/admin/products/" + product.id);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Si peu de pages, afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages pertinentes
      if (currentPage <= 3) {
        // Début de la pagination
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fin de la pagination
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // Milieu de la pagination
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <section>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Gestion des Produits
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredProducts.length} produit(s) sur {products.length}
            </p>
            {totalProducts > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {totalProducts} produit{totalProducts > 1 ? "s" : ""} au total
              </p>
            )}
          </div>
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
            Array.from({ length: limit }).map((_, i) => (
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
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        {!isLoading && products.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
            <div className="text-sm text-green-700 font-medium">
              Page {currentPage} sur {totalPages}
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton Précédent */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <ChevronLeft size={16} />
                Précédent
              </Button>

              {/* Numéros de page */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-10 ${
                        currentPage === page
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              {/* Sélecteur de page mobile */}
              <div className="sm:hidden">
                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="px-3 py-1 border rounded-md text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <option key={page} value={page}>
                        Page {page}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Bouton Suivant */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                Suivant
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminProduit;
