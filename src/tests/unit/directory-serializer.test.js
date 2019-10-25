import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';

import { rawDirectories, expectedSerializedDirectory } from './mock-data';
import { serializeDirectories, serializeDirectory } from '../../api/v2/serializers/directory-serializer';
import { testMultipleResources, performValueOperations } from './test-utils';

chai.should();
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Test directory-serializer', () => {
  describe('Test serializeDirectory', () => {
    it('serializeDirectory should form a single JSON result as defined in openapi', () => {
      const rawTestDirectory = _.cloneDeep(rawDirectories[0]);
      const serializedDirectory = serializeDirectory(rawTestDirectory);
      expect(serializedDirectory).to.deep.equal(expectedSerializedDirectory);
    });
  });

  describe('Test serializeDirectories', () => {
    it('serializeDirectories should form a multiple JSON result as defined in openapi', () => {
      const query = {
        'page[size]': '2',
        'page[number]': '1',
      };
      const toBeSerialized = _.toArray(_.cloneDeep(rawDirectories));
      const rawTestDirectories = performValueOperations(rawDirectories);
      const serializedDirectories = serializeDirectories(toBeSerialized, query);
      testMultipleResources(serializedDirectories, rawTestDirectories, 'directory', 'osuUid');
    });
  });
});