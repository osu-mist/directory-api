import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import * as directorySerializer from 'api/v2/serializers/directory-serializer';
import { createClientStub } from './test-util';
import { /* singleResultInList, singleResult, */ multiResult } from './mock-data';

chai.should();
chai.use(chaiAsPromised);

let directoryDao;

describe('Test directory-dao', () => {
  beforeEach(() => {
    const serializeDirectoryStub = sinon.stub(directorySerializer, 'serializeDirectory');
    const serializeDirectoriesStub = sinon.stub(directorySerializer, 'serializeDirectories');
    serializeDirectoryStub.returnsArg(0);
    serializeDirectoriesStub.returnsArg(0);

    directoryDao = proxyquire('api/v2/db/ldap/directory-dao', {
      '../../serializers/directory-serializer': {
        serializeDirectory: serializeDirectoryStub,
        serializeDirectories: serializeDirectoriesStub,
      },
    });
  });
  afterEach(() => sinon.restore());
  /*
  describe('Test getDirectory', () => {
    const testCaseList = [singleResult];
  });
  */
  describe('Test getDirectories', () => {
    const testCaseList = [multiResult];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getDirectories should be fulfilled with ${description}`, () => {
        createClientStub(testCase);
        const result = directoryDao.getDirectories({});
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });
});
