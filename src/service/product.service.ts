import Axios from "@/lib/axiosInstance";

export const ProductService = {
  BASE_PATH: "/produits",
  async getAllProducts(page: number = 1, limit: number = 12): Promise<ProductResponse> {
    const response = await Axios.get(`${this.BASE_PATH}?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getAllProductsPaysan(page: number = 1, limit: number = 12): Promise<ProductResponse> {
    const response = await Axios.get(`${this.BASE_PATH}/paysan?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createProduct(productData: FormData): Promise<Product> {
    const response = await Axios.post(this.BASE_PATH, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async getProductById(productId: string): Promise<Product> {
    const response = await Axios.get(`${this.BASE_PATH}/${productId}`);
    return response.data;
  },
  async getProductsByUserId(userId: string): Promise<ProductResponse> {
    const response = await Axios.get(`${this.BASE_PATH}/user/${userId}`);
    return response.data;
  },
  async updateProduct(productId: string, productData: FormData): Promise<Product> {
    const response = await Axios.put(`${this.BASE_PATH}/${productId}`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async deleteProduct(productId: string): Promise<void> {
    await Axios.delete(`${this.BASE_PATH}/${productId}`);
  }
};