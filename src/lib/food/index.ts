import axios, { AxiosInstance } from 'axios';
import FoodEntryV1 from '../../models/FoodEntryV1';

export default class FoodClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `https://${process.env.HEALTH_URL}`,
    });
  }

  getFoodDataAsync = async (userId: string): Promise<Array<FoodEntryV1>> => {
    const response = await this.client
      .get(`/v1/${userId}/food`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

    return response.data;
  };
}
