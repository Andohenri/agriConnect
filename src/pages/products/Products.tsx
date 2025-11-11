import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Role } from '@/types/enums';
import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardSkeleton } from "@/components/composant/ProductCard";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useProduct } from "@/contexts/ProductContext";
import { ProductService } from "@/service/product.service";

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setIsEditing, setIsAdding, setProduct } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleAddProduct = () => {
    setProduct(null);
    setIsAdding(true);
    setIsEditing(false);
    navigate('/products/add');
  };

  const handleEditProduct = (product: Product) => {
    setProduct(product);
    setIsEditing(true);
    setIsAdding(false);
    navigate('/products/add');
  };

  return (
    <section>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold">
            {user?.role === Role.PAYSAN ? "Mes Produits" : "Produits Disponibles"}
          </h2>
          {user?.role === Role.PAYSAN && (
            <Button onClick={handleAddProduct} className="btn-primary flex items-center gap-2">
              <Plus size={24} />
              Ajouter un produit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Afficher les skeletons pendant le chargement
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            // Message si aucun produit
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit disponible</p>
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
      </div>
    </section>
  );
};

export default Products;
