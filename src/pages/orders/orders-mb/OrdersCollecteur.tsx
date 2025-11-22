import { EmptyState } from "@/components/composant/EmptyState";
import OrderCard from "@/components/composant/OrderCard";
import { OrderCardSkeleton } from "@/components/composant/OrderCardSkeleton";
import { Role, CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import { ProposalModal } from "@/components/composant/ProposalModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { OrderService } from "@/service/order.service";
import { Plus, Target } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const OrdersCollecteur: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
 const [grid, setGrid] = useState<boolean>(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await OrderService.getAllOrdersCollecteur(
        user?.id || ""
      );
      console.log(response);
      setOrders(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return;
  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-5">
        <div>
          <h1 className="text-lg md:text-3xl font-bold">
            {user?.role === Role.PAYSAN ? "Commandes reçues" : "Mes Commandes"}
          </h1>
          <p className="text-gray-600 text-[13px] mt-1">
            {/* {orders.length} commande(s) au total */}
          </p>
        </div>
        <div className="flex items-center gap-5">
            <GridLayout grid={grid} changeGrid={setGrid}/>
          {user?.role === Role.COLLECTEUR && (
            <Button
              onClick={() => navigate("/orders/ask")}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={24} />
              Publier une demande
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-6 grid xl:grid-cols-3 lg:grid-cols-2 gap-4 p-5 pt-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <EmptyState
              title="Aucune Demande envoyée"
              description="Vous n’avez pas encore de demande. Elles apparaîtront ici dès qu’il y en aura."
              media={<Target />}
            />
          </div>
        ) : (
          orders.map((order, i) => (
            <>
              <OrderCard
                key={i}
                order={order}
                // onAcceptLine={handleAcceptOrderLine}
                // onRejectLine={handleRejectOrderLine}
                // onContact={handleContact}
                //   onProposeOffer={() => setShowProposalModal(true)}
              />

              <ProposalModal
                isOpen={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                order={order}
              />
            </>
          ))
        )}
      </div>
    </>
  );
};

export default OrdersCollecteur;

export const GridLayout = ({
  grid = false,
  changeGrid,
}: {
  grid: boolean;
  changeGrid: (isGrid: boolean) => void;
}) => {
  return (
    <div>
      <div className="flex rounded-xl overflow-hidden border bg-slate-200 text-slate-800 dark:text-gray-100 dark:bg-gray-950">
        <button
          type="button"
          onClick={() => changeGrid(false)}
          className={cn("p-2 relative", !grid ? "text-white" : "")}
        >
          {!grid && (
            <motion.div
              layoutId="active"
              className="absolute inset-0 text-white bg-linear-to-tr from-green-500 to-green-600 rounded-xl"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <List className="relative w-5 h-5 z-10" />
        </button>

        <button
          type="button"
          onClick={() => changeGrid(true)}
          className={cn("p-2 relative", grid ? "text-white" : "")}
        >
          {grid && (
            <motion.div
              layoutId="active"
              className="absolute inset-0 text-white bg-gradient-to-tr from-green-500 to-green-600 rounded-xl"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <LayoutGrid className="relative w-5 h-5 z-10" />
        </button>
      </div>
    </div>
  );
};
