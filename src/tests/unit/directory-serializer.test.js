import _ from 'lodash';

import { rawDirectories } from './mock-data';
import {
  serializeDirectories,
  serializeDirectory,
} from '../../api/v2/serializers/directory-serializer';
import {
  testMultipleResources,
  performValueOperations,
  performMultipleValueOperations,
  testSingleResource,
} from './test-utils';

describe('Test directory-serializer', () => {
  describe('Test serializeDirectory', () => {
    it('serializeDirectory should form a single JSON result as defined in openapi', () => {
      const toBeSerialized = _.cloneDeep(rawDirectories[0]);
      const directoryAttributes = performValueOperations(rawDirectories[0]);
      const serializedDirectory = serializeDirectory(toBeSerialized);
      testSingleResource(serializedDirectory, directoryAttributes, 'directory', 'osuUid');
    });
  });

  describe('Test serializeDirectories', () => {
    it('serializeDirectories should form a multiple JSON result as defined in openapi', () => {
      const query = {
        'page[size]': '2',
        'page[number]': '1',
      };
      const toBeSerialized = _.toArray(_.cloneDeep(rawDirectories));
      const directoriesAttributes = performMultipleValueOperations(rawDirectories);
      const serializedDirectories = serializeDirectories(toBeSerialized, query);
      testMultipleResources(serializedDirectories, directoriesAttributes, 'directory', 'osuUid');
    });
  });
});
