/* eslint-disable @typescript-eslint/indent */

import axios, { AxiosInstance } from 'axios';
import FitBitFoodEntryV1 from '../models/FitBitFoodEntryV1';
import FitBitListFoodsResponseV1 from '../models/FitBitListFoodsResponseV1';
import FitBitSleepV1 from '../models/FitBitSleepV1';

export default class FitbitFoodClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.fitbit.com',
    });
  }

  // getSleepMetricsAsync = async (
  //   access_token: string,
  //   from: string,
  //   to: string,
  // ): Promise<FitBitSleepV1> => {
  //   try {
  //     const response = await this.client
  //       .get<FitBitSleepV1>(`1.2/user/-/sleep/date/${from}/${to}.json`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${access_token}`,
  //             'Content-Type': 'application/json',
  //             'Accept-Language': 'en_GB',
  //           },
  //         });

  //     return response.data;
  //   } catch (err) {
  //     return undefined;
  //   }
  // };

  getUnits = async (
    access_token: string,
  ): Promise<FitBitSleepV1> => {
    const response = await this.client
      .get<FitBitSleepV1>('/1/foods/units.json',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'en_GB',
          },
        });

    return response.data;
  };

  getFoodLogAsync = async (
    access_token: string,
    date: string,
  ): Promise<FitBitListFoodsResponseV1> => {
    const response = await this.client
      .get<FitBitListFoodsResponseV1>(`/1/user/-/foods/log/date/${date}.json`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'en_GB',
          },
        });
    return response.data;
  };

  addFoodItemAsync = async (access_token: string, request: FitBitFoodEntryV1) => {
    const data = Object.entries(request).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    const response = await this.client.post<FitBitFoodEntryV1>('/1/user/-/foods/log.json', data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Accept-Language': 'en_GB',
      },
    });

    return response;
  };

  deletefoodLogAsync = async (
    access_token: string,
    foodLogId: string,
  ): Promise<boolean> => {
    // https://api.fitbit.com/1/user/[user-id]/foods/log/[food-log-id].json
    const response = await this.client.delete(`/1/user/-/foods/log/${foodLogId}.json`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Accept-Language': 'en_GB',
      },
    });

    return response.status === 204;
  };
}
