const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { paginate } = appRoot.require('utils/paginator');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const directoryResourceProp = openapi.definitions.DirectoryResourceObject.properties;
const directoryResourceType = directoryResourceProp.type.enum[0];
const directoryResourceKeys = _.keys(directoryResourceProp.attributes.properties);
const directoryResourcePath = 'directory';
const directoryResourceUrl = resourcePathLink(apiBaseUrl, directoryResourcePath);

const ldapKeyToResourceKey = {
  givenName: 'firstName',
  sn: 'lastName',
  cn: 'fullName',
  osuPrimaryAffiliation: 'primaryAffiliation',
  title: 'jobTitle',
  osuDepartment: 'department',
  postalAddress: 'departmentMailingAddress',
  telephoneNumber: 'officePhoneNumber',
  osuOfficeAddress: 'officeAddress',
  facsimileTelephoneNumber: 'faxNumber',
  mail: 'emailAddress',
  uid: 'username',
  osuAltPhoneNumber: 'alternatePhoneNumber',
  osuUID: 'osuUid',
};

const resourceKeyToLdapKey = _.invert(ldapKeyToResourceKey);

const valueOperations = (key, value) => {
  switch (key) {
    case 'telephoneNumber':
    case 'osuAltPhoneNumber':
    case 'facsimileTelephoneNumber': {
      return `+${value}`;
    }
    case 'osuPrimaryAffiliation': {
      return {
        S: 'Student',
        E: 'Employee',
        O: 'Other',
        R: 'Retiree',
        U: 'Unknown',
      }[value];
    }
    case 'osuOfficeAddress':
    case 'postalAddress': {
      return value.replace(/\$/g, ', ');
    }
    default: {
      return value;
    }
  }
};

/**
 * The resourceKeys serializer argument requires LDAP keys
 */
_.forEach(directoryResourceKeys, (key, index) => {
  directoryResourceKeys[index] = resourceKeyToLdapKey[key];
});

/**
 * @summary Serialize directoryResources to JSON API
 * @function
 * @param {[Object]} rawDirectory Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized directoryResources object
 */
const serializeDirectories = (rawDirectories, query) => {
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  rawDirectories.forEach((directory) => {
    Object.keys(directory).forEach((key) => {
      directory[key] = valueOperations(key, directory[key]);
    });
  });

  const pagination = paginate(rawDirectories, pageQuery);
  pagination.totalResults = rawDirectories.length;
  rawDirectories = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(directoryResourceUrl, query);

  const serializerArgs = {
    identifierField: 'osuUID',
    resourceKeys: directoryResourceKeys,
    pagination,
    resourcePath: directoryResourcePath,
    keyForAttribute: attribute => (ldapKeyToResourceKey[attribute]),
    topLevelSelfLink,
    query: _.omit(query, 'page[size]', 'page[number]'),
    enableDataLinks: true,
    resourceType: directoryResourceType,
  };

  return new JsonApiSerializer(
    directoryResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawDirectories);
};

/**
 * @summary Serialize directoryResource to JSON API
 * @function
 * @param {Object} rawDirectory Raw data row from data source
 * @returns {Object} Serialized directoryResource object
 */
const serializeDirectory = (rawDirectory) => {
  Object.keys(rawDirectory).forEach((key) => {
    rawDirectory[key] = valueOperations(key, rawDirectory[key]);
  });

  const serializerArgs = {
    identifierField: 'osuUID',
    resourceKeys: directoryResourceKeys,
    resourcePath: directoryResourcePath,
    keyForAttribute: attribute => (ldapKeyToResourceKey[attribute]),
    enableDataLinks: true,
    resourceType: directoryResourceType,
  };

  return new JsonApiSerializer(
    directoryResourceType,
    serializerOptions(serializerArgs, directoryResourcePath),
  ).serialize(rawDirectory);
};

module.exports = { serializeDirectories, serializeDirectory };
