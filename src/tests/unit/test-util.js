
import sinon from 'sinon';
import { expect } from 'chai';
import _ from 'lodash';
import * as conn from 'api/v2/db/ldap/connection';
import { openapi } from 'utils/load-openapi';
import { fakeBaseUrl } from './mock-data';
// import { clear } from 'winston';


/**
 * @summary Create the stub for client object that is useful for controlled testing environment.
 * @function
 * @param {object} testCase The testcase that becomes the return value of client.promiseSearch
 * in the stub.
 * @returns {object} An object of all the interal function stub created for this stub.
 */
const createClientStub = () => sinon.stub(conn, 'getClient').resolves({});


/**
 * @summary Transform the rawData into serializedData.
 * @param {string} resourceType The type of resource.
 * @param {string} resourceId The id of resource.
 * @param {object} resourceAttributes The attribute of the resource.
 * @param {object} relationships Relationships of the resource
 * @returns {object} Expected serialized rawData.
 */
const resourceSchema = (resourceType, resourceId, resourceAttributes, relationships) => {
  const fakeUrl = `/${fakeBaseUrl}/${resourceType}s/${resourceId}`;
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
  if (relationships) {
    const resourceRelationships = {};
    _.forEach(relationships, ({ relationshipType, relationshipFields }) => {
      resourceRelationships[relationshipType] = { data: relationshipFields };
    });
    schema.data.relationships = resourceRelationships;
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
  relationships,
) => {
  expect(serializedResources).to.have.all.keys('data', 'links');
  expect(serializedResources.data).to.be.an('array');
  _.zipWith(rawResources, serializedResources.data, relationships, (a, b, c) => {
    let schema;
    if (relationships) {
      schema = resourceSchema(
        resourceType,
        a[resourceKey],
        _.omit(a, resourceKey),
        [c],
      ).data;
    } else {
      schema = resourceSchema(
        resourceType,
        a[resourceKey],
        _.omit(a, resourceKey),
      ).data;
    }
    expect(b).to.deep.equal(schema);
  });
};

export {
  createClientStub,
  resourceSchema,
  testSingleResource,
  testMultipleResources,
  getDefinition,
};
