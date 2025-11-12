import Axios from "@/lib/axiosInstance";

export const OrderService = {
    BASE_PATH: "/orders",
    async getAllOrders(): Promise<OrderResponse> {
        const response = await Axios.get(`${this.BASE_PATH}?page=1&limit=10`);
        return response.data;
    },
    async createOrder(orderData: FormData): Promise<Order> {
        const response = await Axios.post(this.BASE_PATH, orderData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    async getOrderById(orderId: string): Promise<Order> {
        const response = await Axios.get(`${this.BASE_PATH}/${orderId}`);
        return response.data;
    },
    async updateOrder(orderId: string, orderData: FormData): Promise<Order> {
        const response = await Axios.put(`${this.BASE_PATH}/${orderId}`, orderData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    async deleteOrder(orderId: string): Promise<void> {
        await Axios.delete(`${this.BASE_PATH}/${orderId}`);
    }
};