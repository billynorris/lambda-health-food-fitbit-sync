import handlerLogic from '.';

// eslint-disable-next-line import/no-absolute-path
const middy = require('/opt/lambda-middy-layer/nodejs');

// eslint-disable-next-line import/prefer-default-export
export const handler = middy(handlerLogic, 'AWS_PROXY', {
  secrets: {
    fitbitOAuthConfig: process.env.FITBIT_OAUTH,
  },
});
