import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import * as directorySerializer from 'api/v2/serializers/directory-serializer';
import { singleResult, multiResult, noQueryParams } from './mock-data';

chai.should();
chai.use(chaiAsPromised);

const proxyDao = (endpointName) => {
  const option = endpointName === 'getDirectory' ? 'searchEntry' : 'end';
  const proxyquireObject = {
    util: {
      promisify: () => sinon.stub().resolves({
        on: (type, listener) => {
          if (type === option) {
            listener(option === 'searchEntry' ? { object: {} } : undefined);
          }
        },
      }),
    },
    './connection': {
      getClient: sinon.stub().returns({ search: {} }),
    },
  };
  return proxyquire('api/v2/db/ldap/directory-dao', proxyquireObject);
};

const testEndpoint = (endpoint, endpointName, testObject) => {
  const { testCase, expectedResult, description } = testObject;
  describe(`Test ${endpointName}`, () => {
    it(`${endpointName} should be ${description}`, () => {
      const serializer = endpointName === 'getDirectory' ? 'serializeDirectory' : 'serializeDirectories';
      const serializerStub = sinon.stub(directorySerializer, serializer);
      serializerStub.returnsArg(0);
      const result = endpoint(testCase);
      return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
    });
  });
};

describe('Test directory-dao', () => {
  afterEach(() => sinon.restore());
  let endpointName = 'getDirectory';
  // Test that getDirectory returns a single result
  testEndpoint(proxyDao(endpointName).getDirectory, endpointName, singleResult);

  endpointName = 'getDirectories';
  // Test that getDirectories returns multiple results
  testEndpoint(proxyDao(endpointName).getDirectories, endpointName, multiResult);

  // Test that getDirectories returns undefined when no query parameters are passed
  testEndpoint(proxyDao(endpointName).getDirectories, endpointName, noQueryParams);
});
