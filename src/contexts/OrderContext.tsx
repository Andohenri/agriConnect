import { createContext, useContext, useState, type ReactNode } from "react";

interface OrderContextType {
  order: Order | null;
  setOrder: (order: Order | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  resetOrderState: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const resetOrderState = () => {
    setOrder(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  return (
    <OrderContext.Provider
      value={{
        order,
        setOrder,
        isEditing,
        setIsEditing,
        isAdding,
        setIsAdding,
        resetOrderState,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
