const _ = require('lodash');
const { serializeDirectories, serializeDirectory } = require('../../serializers/directory-serializer');

const conn = require('./connection');

/**
 * @summary Map endpoint query to ldap query
 * @function
 * @returns {string} string representing search filter for ldap query
 */
const mapQuery = (endpointQuery) => {
  const keyMap = {
    fuzzyName: 'cn',
    lastName: 'sn',
    firstName: 'givenName',
    primaryAffiliation: 'osuPrimaryAffiliation',
    onid: 'uid',
    emailAddress: 'mail',
    officePhoneNumber: 'telephoneNumber',
    alternatePhoneNumber: 'osuAltPhoneNumber',
    faxNumber: 'facsimileTelephoneNumber',
    phoneNumber: 'telephoneNumber',
    officeAddress: 'osuOfficeAddress',
    department: 'osuDepartment',
  };

  const valueOperations = (key, value) => {
    const ldapKey = keyMap[key]
    const defaultOperation = `${ldapKey}=${value}`;
    switch (key) {
      case 'fuzzyName': {
        let fuzzyFilters = '|'; // 'or' condition for all name orderings

        const valueTerms = value.split(/[ ,]+/);
        _.forEach(_.range(valueTerms.length), (commaIndex) => {
          let firstName = `${valueTerms.slice(0, commaIndex).join(' ')}`;
          let lastName = `${valueTerms.slice(commaIndex).join(' ')}`;

          // Add leading wildcard for non-null first and last names
          firstName = firstName ? `*${firstName}` : firstName;
          lastName = lastName ? `*${lastName}` : lastName;

          // Consider first, last ordering and last, first ordering with trailing wildcard
          fuzzyFilters += `(${ldapKey}=${firstName}*, ${lastName}*)`;
          fuzzyFilters += `(${ldapKey}=${lastName}*, ${firstName}*)`;
        });

        return fuzzyFilters;
      }
      case 'officePhoneNumber':
      case 'alternatePhoneNumber':
      case 'faxNumber'
      case 'officeAddress': {
        return `(${ldapKey}=*${value}*)`
      }
      case 'phoneNumber': {
        return `|(${ldapKey}=*${value}*)(${keyMap.alternatePhoneNumber}=*${value}*)`
          + `(${keyMap.faxNumber}=*${value}*)`;
      }
      case 'primaryAffiliation': {
        return `${ldapKey}=${{
          Student: 'S',
          Employee: 'E',
          Other: 'O',
          Retiree: 'R',
          Unknown: 'U',
        }[value]}`;
      }
      default: {
        return defaultOperation;
      }
    }
  };

  let ldapQuery = '';
  _.keys(endpointQuery).forEach((key) => {
    if (keyMap[key]) ldapQuery += `(${valueOperations(key, endpointQuery[key])})`;
  });
  if (ldapQuery) ldapQuery = `(&${ldapQuery})`;
  return ldapQuery;
};

/**
 * @summary Return a directory
 * @function
 * @returns {Promise<Object>} Promise object represents a serialized directory resource
 */
const getDirectory = pathParameter => new Promise((resolve, reject) => {
  const client = conn.getClient();
  client.search('o=orst.edu', { filter: `osuUID=${pathParameter}`, scope: 'sub' }, (err, res) => {
    res.on('searchEntry', (entry) => {
      resolve(serializeDirectory(entry.object));
    });
    res.on('error', (error) => {
      reject(error);
    });
    res.on('end', () => {
      resolve(undefined);
    });
  });
});

/**
 * @summary Return a list of directories
 * @function
 * @returns {Promise<object>} Promise object represents a serilized list of directory resrouces
 */
const getDirectories = endpointQuery => new Promise((resolve, reject) => {
  const ldapQuery = mapQuery(endpointQuery);
  if (!ldapQuery) {
    resolve(undefined);
  } else {
    const client = conn.getClient();
    const searchResults = [];
    client.search('o=orst.edu', { filter: ldapQuery, scope: 'sub' }, (err, res) => {
      res.on('searchEntry', (entry) => {
        searchResults.push(entry.object);
      });
      res.on('error', (error) => {
        reject(error);
      });
      res.on('end', () => {
        resolve(serializeDirectories(searchResults, endpointQuery));
      });
    });
  }
});

module.exports = { getDirectory, getDirectories };
