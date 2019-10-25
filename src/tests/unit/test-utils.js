import { expect } from 'chai';
import _ from 'lodash';

import { openapi } from 'utils/load-openapi';
import { fakeBaseUrl } from './mock-data';
import { valueOperations, ldapKeyToResourceKey } from '../../api/v2/serializers/directory-serializer';


/**
 * @summary Transform the rawData into serializedData.
 * @param {string} resourceType The type of resource.
 * @param {string} resourceId The id of resource.
 * @param {object} resourceAttributes The attribute of the resource.
 * @returns {object} Expected serialized rawData.
 */
const resourceSchema = (resourceType, resourceId, resourceAttributes) => {
  const fakeUrl = `/${fakeBaseUrl}/${resourceType}/${resourceId}`;
  const schema = {
    links: {
      self: fakeUrl,
    },
    data: {
      id: resourceId,
      type: resourceType,
      links: {
        self: fakeUrl,
      },
    },
  };
  if (resourceAttributes) {
    resourceAttributes = _.mapKeys(resourceAttributes,
      (value, key) => _.camelCase(key));
    schema.data.attributes = resourceAttributes;
  }
  return schema;
};

/**
 * Get the schema of a type of resource.
 *
 * @param {string} def The type of the resource.
 * @returns {object} The schema of the resource to look up.
 */
const getDefinition = (def) => openapi.definitions[def].properties;

/**
 * @summary Test if a single resource matches the schema in the specification.
 * @param {object} serializedResource serialized resource to be tested.
 * @param {string} resourceType The type of the resource.
 * @param {string} resourceId The id of the resource.
 * @param {object} nestedProps The attributes of the resource.
 * @param {[object]} relationships The relationships of the resource.
 */
const testSingleResource = (serializedResource,
  resourceType, resourceId, nestedProps, relationships) => {
  expect(serializedResource).to.deep.equal(resourceSchema(resourceType,
    resourceId,
    nestedProps,
    relationships));
};

/**
 * Validate multiple serialized resources.
 *
 * @param {object} serializedResources serialized resource to be tested.
 * @param {object} rawResources Raw resources to be used in test.
 * @param {*} resourceType The type of the resource.
 * @param {*} resourceKey The id of the resource.
 * @param {object} relationships The relationships of the resource.
 */
const testMultipleResources = (
  serializedResources,
  rawResources,
  resourceType,
  resourceKey,
) => {
  expect(serializedResources).to.have.all.keys('data', 'meta', 'links');
  expect(serializedResources.data).to.be.an('array');
  _.zipWith(rawResources, serializedResources.data, (a, b) => {
    const schema = resourceSchema(resourceType, a[resourceKey], a).data;
    expect(b).to.deep.equal(schema);
  });
};

/**
 * Validate multiple serialized resources.
 *
 * @param {object} rawDirectories Array of raw directory objects
 * @returns {object} Array of directory objects with converted resource key values.
 */
const performValueOperations = (rawDirectories) => {
  const rawTestDirectories = _.cloneDeep(rawDirectories);
  _.forEach(rawTestDirectories, (directory) => {
    _.keys(directory).forEach((key) => {
      switch (key) {
        case 'objectClass':
        case 'controls':
        case 'dn':
          break;
        default:
          directory[key] = valueOperations(key, directory[key]);
          directory[ldapKeyToResourceKey[key]] = directory[key];
      }
      delete directory[key];
      // console.log('directory:', directory);
    });
  });
  return _.toArray(rawTestDirectories);
};

export {
  resourceSchema,
  testSingleResource,
  testMultipleResources,
  getDefinition,
  performValueOperations,
};
