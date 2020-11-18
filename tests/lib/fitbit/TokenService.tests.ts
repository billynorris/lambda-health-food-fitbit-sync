import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SinonStub } from 'sinon';
import { ImportMock } from 'ts-mock-imports';
import axios from 'axios';

import FitBitTokenService from '../../../src/lib/fitbit/TokenService';
import FitBitTokenDetailsV1 from '../../../src/models/FitBitTokenDetailsV1';

chai.use(chaiAsPromised);
describe('lib/fitbit/TokenService Integration tests', () => {
  let sut: FitBitTokenService;
  let axiosPostStub: SinonStub<any>;

  let axiosPostResponseResult: FitBitTokenDetailsV1;

  beforeEach(() => {
    const mockAxiosClient = ImportMock.mockFunction(axios, 'create');

    axiosPostStub = ImportMock.mockFunction(axios, 'get');

    mockAxiosClient.returns({
      post: axiosPostStub,
    });

    axiosPostStub.callsFake(() => ({
      data: axiosPostResponseResult,
    }));

    sut = new FitBitTokenService(undefined, undefined);
  });

  afterEach(() => {
    axiosPostStub.restore();
  });

  it('Calls refresh token endpoint as expected', async () => {
    // Arrange
    axiosPostResponseResult = {
      access_token: '775da23c-bcc6-46e1-8db1-caee8ae78629',
      refresh_token: 'a1db934d-2e08-4d2e-8fa4-df39d843fa4f',
      token_type: 'Bearer',
      expires_in: 28800,
      scope: 'location sleep activity heartrate social settings nutrition profile weight',
      user_id: 'a52f10cc-a433-4d18-aeb9-75a50f14122e',
    };

    const existingTokenDetails: FitBitTokenDetailsV1 = {
      access_token: 'b33abec3-7223-41ae-99ce-20b06ad1ac44',
      refresh_token: '0b7d75e7-9f7e-4a30-8979-f2688c459517',
      token_type: 'Bearer',
      expires_in: 28800,
      created_at: 0,
      scope: 'location sleep activity heartrate social settings nutrition profile weight',
      user_id: 'b01cc032-28d7-4c46-9d6c-108f802b6779',
    };

    // Act
    const refreshTokenResult = await sut.refreshTokenAsync(existingTokenDetails);

    // Assert
    expect(axiosPostStub.calledOnce).eql(true);
    expect(axiosPostStub.args[0][0]).eql('/oauth2/token');
    expect(axiosPostStub.args[0][1]).eql(`grant_type=refresh_token&refresh_token=${existingTokenDetails.refresh_token}`);

    expect(refreshTokenResult.created_at).not.eql(undefined);
    expect(refreshTokenResult.access_token).eql(axiosPostResponseResult.access_token);
    expect(refreshTokenResult.refresh_token).eql(axiosPostResponseResult.refresh_token);
    expect(refreshTokenResult.token_type).eql(axiosPostResponseResult.token_type);
    expect(refreshTokenResult.expires_in).eql(axiosPostResponseResult.expires_in);
    expect(refreshTokenResult.scope).eql(axiosPostResponseResult.scope);
    expect(refreshTokenResult.user_id).eql(axiosPostResponseResult.user_id);
  });
});
