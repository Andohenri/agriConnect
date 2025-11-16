import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Role } from "@/types/enums";
import { Button } from "@/components/ui/button";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/composant/ProductCard";
import { Plus, ChevronLeft, ChevronRight, BoxIcon, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct } from "@/contexts/ProductContext";
import { ProductService } from "@/service/product.service";
import { EmptyState } from "@/components/composant/EmptyState";

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setIsEditing, setIsAdding, setProduct } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(12); // Nombre de produits par page

  useEffect(() => {
    fetchProducts();
  }, [currentPage]); // Recharger quand la page change

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      if (user?.role === Role.PAYSAN) {
        const response = await ProductService.getAllProductsPaysan(
          currentPage,
          limit
        );
        if (response?.data) {
          setProducts(response.data);
          setTotalPages(response.totalPages || 1);
          setTotalProducts(response.totalItems || 0);
        } else {
          console.warn("Unexpected products response:", response);
        }
      } else {
        const response = await ProductService.getAllProducts(
          currentPage,
          limit
        );
        if (response?.data) {
          setProducts(response.data);
          setTotalPages(response.totalPages || 1);
          setTotalProducts(response.totalItems || 0);
        } else {
          console.warn("Unexpected products response:", response);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setProduct(null);
    setIsAdding(true);
    setIsEditing(false);
    navigate("/products/add");
  };

  const handleEditProduct = (product: Product) => {
    setProduct(product);
    setIsEditing(true);
    setIsAdding(false);
    navigate("/products/add");
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {user?.role === Role.PAYSAN
                ? "Mes Produits"
                : "Produits Disponibles"}
            </h2>
            {totalProducts > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {totalProducts} produit{totalProducts > 1 ? "s" : ""} au total
              </p>
            )}
          </div>
          {user?.role === Role.PAYSAN && (
            <Button
              onClick={handleAddProduct}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={24} />
              Ajouter un produit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Afficher les skeletons pendant le chargement
            Array.from({ length: limit }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <EmptyState
                title="Aucune production disponible"
                description="Vous n’avez pas encore de produit. Elles apparaîtront ici dès qu’il y en aura."
                media={<Package />}
                actions={[
                  { label: "Creer un produit", onClick: () => handleAddProduct() },
                ]}
              />
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                userRole={user?.role}
                onEdit={() => handleEditProduct(product)}
              />
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

export default Products;
