import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import FitBitTokenService from '../../../src/lib/fitbit/TokenService';
import FitBitTokenDetailsV1 from '../../../src/models/FitBitTokenDetailsV1';

chai.use(chaiAsPromised);
describe('lib/fitbit/TokenService Integration tests', () => {
  let sut: FitBitTokenService;

  beforeEach(() => {
    Object.assign(process.env, {
      FITBIT_CLIENT_ID: 'N/A',
      FITBIT_CLIENT_SECRET: 'N/A',
    });
    sut = new FitBitTokenService(
      process.env.FITBIT_CLIENT_ID,
      process.env.FITBIT_CLIENT_SECRET,
    );
  });

  afterEach(() => {

  });

  it.skip('Successfully refreshes token', async () => {
    // Arrange
    const existingTokenDetails: FitBitTokenDetailsV1 = {
      access_token: 'N/A',
      refresh_token: 'N/A',
      token_type: 'Bearer',
      expires_in: 28800,
      created_at: 1605723077038,
      scope: 'location sleep activity heartrate social settings nutrition profile weight',
      user_id: 'N/A',
    };

    // Act
    const refreshTokenResult = await sut.refreshTokenAsync(existingTokenDetails);

    // Assert
    expect(refreshTokenResult.access_token).not.eql(undefined);
    expect(refreshTokenResult.refresh_token).not.eql(undefined);
    expect(refreshTokenResult.token_type).eql(existingTokenDetails.token_type);
    expect(refreshTokenResult.expires_in).eql(existingTokenDetails.expires_in);
    expect(refreshTokenResult.created_at).not.eql(undefined);
    expect(refreshTokenResult.scope).eql(existingTokenDetails.scope);
    expect(refreshTokenResult.user_id).eql(existingTokenDetails.user_id);
  });
});
