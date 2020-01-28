import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { paginate } from 'utils/paginator';
import { apiBaseUrl, resourcePathLink, paramsLink } from 'utils/uri-builder';

const directoryResourceProp = openapi.definitions.DirectoryResourceObject.properties;
const directoryResourceType = directoryResourceProp.type.enum[0];
const directoryResourcePath = 'directory';
const directoryResourceUrl = resourcePathLink(apiBaseUrl, directoryResourcePath);
const primaryAffiliationMap = {
  S: 'Student',
  E: 'Employee',
  O: 'Other',
  R: 'Retiree',
  U: 'Unknown',
};

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

const ldapKeys = Object.keys(ldapKeyToResourceKey);

/**
 * @summary Manipulates values to match format expected in response
 * @function
 * @param {string} key Ldap key of attribute
 * @param {string} value Value of attribute returned of ldap
 * @returns {string} Value of attribute formatted for response
 */
const valueOperations = (key, value) => {
  switch (key) {
    case 'telephoneNumber':
    case 'osuAltPhoneNumber':
    case 'facsimileTelephoneNumber': {
      return `+${value}`;
    }
    case 'osuPrimaryAffiliation': {
      return primaryAffiliationMap[value];
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
 * @summary perform value operations on resource keys and values
 * @function
 * @param {object} directory a directory resource object
 */
const performValueOperations = (directory) => {
  Object.keys(directory).forEach((key) => {
    directory[key] = valueOperations(key, directory[key]);
  });
  _.forEach(ldapKeys, (value) => {
    if (!directory[value]) {
      directory[value] = null;
    }
  });
};

/**
 * @summary Serialize directoryResources to JSON API
 * @function
 * @param {[object]} rawDirectories Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized directoryResources object
 */
const serializeDirectories = (rawDirectories, query) => {
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  // Perform value operations and add null keys to raw data
  _.forEach(rawDirectories, (directory) => performValueOperations(directory));

  const pagination = paginate(rawDirectories, pageQuery);
  pagination.totalResults = rawDirectories.length;
  rawDirectories = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(directoryResourceUrl, query);

  const serializerArgs = {
    identifierField: 'osuUID',
    resourceKeys: ldapKeys,
    pagination,
    resourcePath: directoryResourcePath,
    keyForAttribute: (attribute) => (ldapKeyToResourceKey[attribute]),
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
 * @param {object} rawDirectory Raw data row from data source
 * @returns {object} Serialized directoryResource object
 */
const serializeDirectory = (rawDirectory) => {
  performValueOperations(rawDirectory);
  const topLevelSelfLink = resourcePathLink(directoryResourceUrl, rawDirectory.osuUID);
  const serializerArgs = {
    identifierField: 'osuUID',
    resourceKeys: ldapKeys,
    resourcePath: directoryResourcePath,
    keyForAttribute: (attribute) => (ldapKeyToResourceKey[attribute]),
    topLevelSelfLink,
    enableDataLinks: true,
    resourceType: directoryResourceType,
  };

  return new JsonApiSerializer(
    directoryResourceType,
    serializerOptions(serializerArgs, directoryResourcePath),
  ).serialize(rawDirectory);
};

export {
  serializeDirectories,
  serializeDirectory,
  primaryAffiliationMap,
  valueOperations,
  ldapKeyToResourceKey,
};
