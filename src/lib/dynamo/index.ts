// eslint-disable-next-line import/no-extraneous-dependencies
import DynamoDB from 'aws-sdk/clients/dynamodb';
import log from '@dazn/lambda-powertools-logger';
import UserDetailsV1 from '../../models/UserDetailsV1';
import FitBitTokenDetailsV1 from '../../models/FitBitTokenDetailsV1';

const https = require('https');

export default class DynamoClient {
  private client: DynamoDB;

  constructor() {
    log.debug('Building new DynamoDb Client');

    const agent = new https.Agent({
      keepAlive: true,
      maxSockets: Infinity,
    });

    this.client = new DynamoDB({
      region: process.env.AWS_REGION,
      httpOptions: {
        agent,
      },
    });
  }

  getUsersAsync = async (): Promise<Array<UserDetailsV1>> => {
    const result = await this.client.scan({
      TableName: process.env.USER_TABLE_NAME,
    }).promise();

    return result.Items.map((x) => DynamoDB.Converter.unmarshall(x) as UserDetailsV1);
  };

  updateTokenAsync = async (
    userId: string,
    tokenDetails: FitBitTokenDetailsV1,
  ): Promise<void> => {
    await this.client.updateItem({
      Key: DynamoDB.Converter.marshall({
        userId,
      }),
      AttributeUpdates: {
        fitbit: {
          Value: DynamoDB.Converter.marshall(tokenDetails),
        },
      },
      TableName: process.env.USER_TABLE_NAME,
    }).promise();
  };
}
