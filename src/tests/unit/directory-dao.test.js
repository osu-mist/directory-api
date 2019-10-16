import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

import * as directorySerializer from 'api/v2/serializers/directory-serializer';
import { singleResult, multiResult } from './mock-data';

chai.should();
chai.use(chaiAsPromised);

let directoryDao;

const proxyDirectory = (option) => {
  const proxyquireObject = {
    './connection': {
      getClient: sinon.stub().returns({ search: {} }),
    },
  };
  if (option === 'getDirectories') {
    proxyquireObject.promisify = () => sinon.stub().resolves({
      on: (type, listener) => {
        if (type === 'end') {
          listener();
        }
      },
    });
  } else if (option === 'getDirectory') {
    proxyquireObject.promisify = () => sinon.stub().resolves({
      on: (type, listener) => {
        if (type === 'searchEntry') {
          listener();
        }
      },
    });
  }
  return proxyquire('api/v2/db/ldap/directory-dao', proxyquireObject);
};

describe('Test directory-dao', () => {
  /*
  beforeEach(() => {
    directoryDao = proxyquire('api/v2/db/ldap/directory-dao', {

      util: {
        promisify: () => sinon.stub().resolves({
          on: (type, listener) => {
            if (type === 'end') {
              listener();
            }
          },
        }),
      },

      './connection': {
        getClient: sinon.stub().returns({ search: {} }),

      },
    });
  });
  */

  afterEach(() => sinon.restore());

  describe('Test getDirectory', () => {
    directoryDao = proxyDirectory('getDirectory');
    const testCaseList = [singleResult];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getDirectory should be fulfilled with ${description}`, () => {
        const serializeDirectoryStub = sinon.stub(directorySerializer, 'serializeDirectory');
        serializeDirectoryStub.returns(testCase);
        const result = directoryDao.getDirectories('fakeId');
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test getDirectories', () => {
    directoryDao = proxyDirectory('getDirectories');
    const testCaseList = [multiResult];
    _.forEach(testCaseList, ({ testCase, expectedResult, description }) => {
      it(`getDirectories should be fulfilled with ${description}`, () => {
        const serializeDirectoriesStub = sinon.stub(directorySerializer, 'serializeDirectories');
        serializeDirectoriesStub.returns(testCase);
        const result = directoryDao.getDirectories({ firstName: 'fakeName' });
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });

    it('getDirectories should return undefined when no query parameters are passed', () => {
      const result = directoryDao.getDirectories({});
      return result.should.eventually.be.fulfilled.and.equal(undefined);
    });
  });
});
