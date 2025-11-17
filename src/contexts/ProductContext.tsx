import { createContext, useContext, useState, type ReactNode, } from 'react';

interface ProductContextType {
  product: Product | null;
  setProduct: (product: Product | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  resetProductState: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  updateProductInList: (productId: string, updates: Partial<Product>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const resetProductState = () => {
    setProduct(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  const updateProductInList = (productId: string, updates: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      )
    );
  };

  return (
    <ProductContext.Provider
      value={{
        product,
        setProduct,
        isEditing,
        setIsEditing,
        isAdding,
        setIsAdding,
        resetProductState,
        products,
        setProducts,
        updateProductInList,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};