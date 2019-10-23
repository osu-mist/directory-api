import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
// import _ from 'lodash';

// import { getDefinition, testSingleResource, testMultipleResources } from './test-util';
import { rawDirectories, expectedSerializedDirectory, expectedSerializedDirectories } from './mock-data';
import { serializeDirectories, serializeDirectory } from '../../api/v2/serializers/directory-serializer';

chai.should();
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Test directory-serializer', () => {
  it('serializeDirectory should form a single JSON result as defined in openapi', () => {
    const rawDirectory = rawDirectories[0];
    const serializedDirectory = serializeDirectory(rawDirectory);
    expect(serializedDirectory).to.deep.equal(expectedSerializedDirectory);
  });

  it('serializeDirectories should form a multiple JSON result as defined in openapi', () => {
    const query = {
      'page[size]': '2',
      'page[number]': '1',
    };
    const serializedDirectories = serializeDirectories(rawDirectories, query);
    // console.log('serializedDirectories:', serializedDirectories.data[0]);
    // console.log('expectedSerializedDirectories', expectedSerializedDirectories.data[0]);
    expect(serializedDirectories).to.deep.equal(expectedSerializedDirectories);
  });
});
