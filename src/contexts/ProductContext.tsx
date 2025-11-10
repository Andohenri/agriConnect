import { createContext, useContext, useState, type ReactNode, } from 'react';

interface ProductContextType {
  product: Product | null;
  setProduct: (product: Product | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  resetProductState: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const resetProductState = () => {
    setProduct(null);
    setIsEditing(false);
    setIsAdding(false);
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