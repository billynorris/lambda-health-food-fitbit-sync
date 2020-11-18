/* eslint-disable no-await-in-loop */
// eslint-disable-next-line import/no-extraneous-dependencies
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import log from '@dazn/lambda-powertools-logger';
import DynamoClient from './lib/dynamo';
import HealthFoodClient from './lib/food';

import FitBitFoodService from './lib/fitbit/FoodService';
import TokenService from './lib/fitbit/TokenService';
import FitBitTokenDetailsV1 from './models/FitBitTokenDetailsV1';

let dynamo: DynamoClient;
let healthFoodClient: HealthFoodClient;
let tokenService: TokenService;
let fitBitFoodService: FitBitFoodService;

interface FitBitSyncContext extends Context {
  fitBitOAuth: {
    clientId: string;
    clientSecret: string;
  }
}

export default async (
  event: APIGatewayProxyEvent,
  context: FitBitSyncContext,
): Promise<APIGatewayProxyResult> => {
  log.debug('Event received', event);
  if (!dynamo) {
    dynamo = new DynamoClient();
    healthFoodClient = new HealthFoodClient();
    tokenService = new TokenService(context.fitBitOAuth.clientId, context.fitBitOAuth.clientSecret);
    fitBitFoodService = new FitBitFoodService();
  }

  const users = await dynamo.getUsersAsync();

  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    try {
      const foodData = await healthFoodClient.getFoodDataAsync(user.userId);

      let token: FitBitTokenDetailsV1;
      if (tokenService.hasTokenExpired(user.fitbit)) {
        token = await tokenService.refreshTokenAsync(user.fitbit);
        await dynamo.updateTokenAsync(user.userId, token);
      } else {
        token = user.fitbit;
      }

      await fitBitFoodService.syncFoodDataAsync(user.fitbit.access_token, foodData);
    } catch (err) {
      log.error('Unable to sync food data for user', {
        userId: user.userId,
      }, err);
    }
  }

  return {
    statusCode: 204,
    body: '',
  };
};
