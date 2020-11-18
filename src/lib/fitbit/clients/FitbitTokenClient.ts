/* eslint-disable @typescript-eslint/indent */

import axios, { AxiosInstance } from 'axios';
import FitBitTokenDetailsV1 from '../../../models/FitBitTokenDetailsV1';

export default class FitbitFoodClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.fitbit.com',
    });
  }

  refreshTokenAsync = async (
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<FitBitTokenDetailsV1> => {
    const request: { [key: string]: string } = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const data = Object.entries(request).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    const response = await this.client
      .post('/oauth2/token', data,
        {
          headers: {
            Authorization: `Basic ${Buffer.from([clientId, clientSecret].join(':')).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

    return response.data;
  };
}
