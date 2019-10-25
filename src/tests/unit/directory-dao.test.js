import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import { singleResult, multiResult, noQueryParams } from './mock-data';

chai.should();
chai.use(chaiAsPromised);

const anonStub = sinon.stub().returnsArg(0);

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
    '../../serializers/directory-serializer': {
      serializeDirectory: anonStub,
      serializeDirectories: anonStub,
    },
  };
  return proxyquire('api/v2/db/ldap/directory-dao', proxyquireObject);
};

const testEndpoint = (endpoint, endpointName, testObject) => {
  const { testCase, expectedResult, description } = testObject;
  it(`${endpointName} should be ${description}`, () => {
    const result = endpoint(testCase);
    return result.should.eventually.be.fulfilled.and.deep.equal(expectedResult);
  });
};

let endpointName;
sinon.replace(config, 'get', () => ({ ldap: {} }));

describe('Test directory-dao', () => {
  afterEach(() => sinon.restore());

  describe('Test getDirectory', () => {
    endpointName = 'getDirectory';
    // Test that getDirectory returns a single result
    testEndpoint(proxyDao(endpointName).getDirectory, endpointName, singleResult);
  });

  describe('Test getDirectories', () => {
    endpointName = 'getDirectories';
    const endpoint = proxyDao(endpointName).getDirectories;
    // Test that getDirectories returns multiple results
    testEndpoint(endpoint, endpointName, multiResult);
    // Test that getDirectories returns undefined when no query parameters are passed
    testEndpoint(endpoint, endpointName, noQueryParams);
  });
});
