import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Role, CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import OrdersCollecteur from "./OrdersCollecteur";
import OrdersPaysan from "./OrdersPaysan";

const Commande = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role;
  return (
    <section className="bg-gray-50 overflow-hidden p-0 pt-2">
      <div className=" mx-auto bg-white md:rounded-2xl h-[calc(100vh-64px)] overflow-scroll">
        {user?.role === Role.COLLECTEUR ? (
          <OrdersCollecteur />
        ) : (
          <OrdersPaysan />
        )}
      </div>
    </section>
  );
};

export default Commande;
