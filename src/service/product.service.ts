import Axios from "@/lib/axiosInstance";

export const ProductService = {
  BASE_PATH: "/produits",
  async getAllProducts(): Promise<ProductResponse> {
    const response = await Axios.get(`${this.BASE_PATH}?page=1&limit=10`);
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
  async updateProduct(productId: string, productData: FormData): Promise<Product> {
    const response = await Axios.patch(`${this.BASE_PATH}/${productId}`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async deleteProduct(productId: string): Promise<void> {
    await Axios.delete(`${this.BASE_PATH}/${productId}`);
  }
};