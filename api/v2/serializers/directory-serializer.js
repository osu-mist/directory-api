const appRoot = require('app-root-path');
const decamelize = require('decamelize');
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

var ldapKeyToResourceKey = attribute => new Map([
   ['firstName', 'firstName'],
   ['sn', 'lastName'],
   ['cn', 'fullName'],
   ['givenName', 'givenName'],
   ['osuPrimaryAffiliation', 'primaryAffiliation'],
   ['title', 'jobTitle'],
   ['osuDepartment', 'department'],
   ['postalAddress', 'departmentMailingAddress'],
   ['telephoneNumber', 'officePhoneNumber'],
   ['osuOfficeAddress', 'officeAddress'],
   ['facsimileTelephoneNumber', 'faxNumber'],
   ['mail', 'emailAddress'],
   ['uid', 'username'],
   ['osuAltPhoneNumber', 'alternatePhoneNumber'],
   ['osuUID', 'osuuid']
]).get(attribute);

var resourceKeyToLdapKey = attribute => new Map([
   ['firstName', 'firstName'],
   ['lastName', 'sn'],
   ['fullName', 'cn'],
   ['givenName', 'givenName'],
   ['primaryAffiliation', 'osuPrimaryAffiliation'],
   ['jobTitle', 'title'],
   ['department', 'osuDepartment'],
   ['departmentMailingAddress', 'postalAddress'],
   ['officePhoneNumber', 'telephoneNumber'],
   ['officeAddress', 'osuOfficeAddress'],
   ['faxNumber', 'facsimileTelephoneNumber'],
   ['emailAddress', 'mail'],
   ['username', 'uid'],
   ['alternatePhoneNumber', 'osuAltPhoneNumber'],
   ['osuuid', 'osuUID']
]).get(attribute);

/**
 * The resourceKeys serializer argument requires LDAP keys
 */
_.forEach(directoryResourceKeys, (key, index) => {
    directoryResourceKeys[index] = resourceKeyToLdapKey(key);
});

/**
 * @summary Serialize directoryResources to JSON API
 * @function
 * @param {[Object]} rawDirectory Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized directoryResources object
 */
const serializeDirectories = (rawDirectories, query) => {
  for (i = 0; i < rawDirectories.length; i++) {
    rawDirectories[i].firstName = rawDirectories[i].givenName;
  }
  const topLevelSelfLink = paramsLink(directoryResourceUrl, query);
  const serializerArgs = {
    identifierField: 'osuUID',
    resourceKeys: directoryResourceKeys,
    resourcePath: directoryResourcePath,
    keyForAttribute: ldapKeyToResourceKey,
    topLevelSelfLink,
    enableDataLinks: true,
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
  rawDirectory.firstName = rawDirectory.givenName;
  const serializerArgs = {
    identifierField: 'osuUID',
    resourceKeys: directoryResourceKeys,
    resourcePath: directoryResourcePath,
    keyForAttribute: ldapKeyToResourceKey,
    enableDataLinks: true
  };

  return new JsonApiSerializer(
    directoryResourceType,
    serializerOptions(serializerArgs, directoryResourcePath),
  ).serialize(rawDirectory);
};

module.exports = { serializeDirectories, serializeDirectory };
