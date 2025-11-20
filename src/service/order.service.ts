import type { PropositionFormData } from "@/components/composant/OrderModal";
import type { ProposalFormData } from "@/components/composant/ProposalModal";
import Axios from "@/lib/axiosInstance";

export const OrderService = {
    BASE_PATH: "/commandes",
    async getAllOrdersRequestPaysan(page: number = 1, limit: number = 12): Promise<OrderResponse> {
        const response = await Axios.get(`/commandes/paysan?page=${page}&limit=${limit}`);
        return response.data;
    },
    async getAllOrdersDirectPaysan(page: number = 1, limit: number = 12): Promise<CommandeProduitResponse> {
        const response = await Axios.get(`/commande-produits/paysan?page=${page}&limit=${limit}`);
        return response.data;
    },
    async getAllOrdersCollecteur(collecteurId: string, page: number = 1, limit: number = 12): Promise<OrderResponse> {
        const response = await Axios.get(`${this.BASE_PATH}/collecteur/${collecteurId}?page=${page}&limit=${limit}`);
        return response.data;
    },
    async getAllOrdersAdmin(page: number = 1, limit: number = 12): Promise<OrderResponse> {
        const response = await Axios.get(`${this.BASE_PATH}/admin/all?page=${page}&limit=${limit}`);
        return response.data;
    },
    async createOrder(orderData: PropositionFormData): Promise<Order> {
        const response = await Axios.post(this.BASE_PATH, orderData);
        return response.data;
    },
    async demmandeOrder(orderData: OrderPublishReq): Promise<Order> {
        const response = await Axios.post(`${this.BASE_PATH}/demander`, orderData);
        return response.data;
    },
    async getOrderById(orderId: string): Promise<Order> {
        const response = await Axios.get(`${this.BASE_PATH}/${orderId}`);
        return response.data;
    },
    async updateOrder(orderId: string, orderData: OrderPublishReq): Promise<Order> {
        const response = await Axios.put(`${this.BASE_PATH}/${orderId}`, orderData);
        return response.data;
    },
    async deleteOrder(orderId: string): Promise<void> {
        await Axios.delete(`${this.BASE_PATH}/${orderId}`);
    },
    async acceptOrder(orderId: string): Promise<Order> {
        const response = await Axios.patch(`commande-produits/${orderId}/accepter`);
        return response.data;
    },
    async rejectOrder(orderId: string): Promise<Order> {
        const response = await Axios.patch(`commande-produits/${orderId}/refuser`);
        return response.data;
    },
    //
    async payOrder(orderId: string): Promise<Order> {
        const response = await Axios.patch(`${this.BASE_PATH}/${orderId}/payer`);
        return response.data;
    },
    async deliverOrder(orderId: string): Promise<Order> {
        const response = await Axios.patch(`commande-produits/${orderId}/livree`);
        return response.data;
    },
    async createProposal(orderId: string, orderData: ProposalFormData): Promise<Order> {
        const response = await Axios.post(`commande-produits/${orderId}/propositions`, orderData);
        return response.data;
    },

    async acceptProposal(lineId: string): Promise<Order> {
        const response = await Axios.patch(`${this.BASE_PATH}/${lineId}/accepter-proposition`);
        return response.data;
    },

    async rejectProposal(lineId: string): Promise<Order> {
        const response = await Axios.patch(`${this.BASE_PATH}/${lineId}/rejeter-proposition`);
        return response.data;
    },

    // Statistiques des commandes pour un paysan
    async getOrdersStatsPaysan(): Promise<OrderStatsResponse> {
        const response = await Axios.get(`${this.BASE_PATH}/stats/paysan`);
        return response.data;
    },

    // Statistiques des commandes pour un collecteur
    async getOrdersStatsCollecteur(): Promise<OrderStatsResponse> {
        const response = await Axios.get(`${this.BASE_PATH}/stats/collecteur`);
        return response.data;
    },
};