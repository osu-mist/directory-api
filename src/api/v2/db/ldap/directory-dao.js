import _ from 'lodash';
import util from 'util';

import { serializeDirectories, serializeDirectory, primaryAffiliationMap } from 'api/v2/serializers/directory-serializer';
import { getClient } from './connection';

/**
 * @summary Map endpoint query to ldap query
 * @function
 * @param {object} endpointQuery query object in terms of API query params
 * @returns {string} string representing search filter for ldap query
 */
const mapQuery = (endpointQuery) => {
  const keyMap = {
    'filter[fullName][fuzzy]': 'cn',
    'filter[lastName]': 'sn',
    'filter[firstName]': 'givenName',
    'filter[primaryAffiliation]': 'osuPrimaryAffiliation',
    'filter[onid]': 'uid',
    'filter[emailAddress]': 'mail',
    'filter[officePhoneNumber][fuzzy]': 'telephoneNumber',
    'filter[alternatePhoneNumber][fuzzy]': 'osuAltPhoneNumber',
    'filter[faxNumber][fuzzy]': 'facsimileTelephoneNumber',
    'filter[phoneNumber][fuzzy]': 'telephoneNumber',
    'filter[officeAddress][fuzzy]': 'osuOfficeAddress',
    'filter[department]': 'osuDepartment',
  };

  const valueOperations = (key, value) => {
    const ldapKey = keyMap[key];
    const defaultOperation = `${ldapKey}=${value}`;
    switch (key) {
      case 'filter[fullName][fuzzy]': {
        let fuzzyFilters = '|'; // 'or' condition for all name orderings

        const valueTerms = value.split(/[ ,]+/);
        _.forEach(_.range(valueTerms.length), (commaIndex) => {
          let firstName = valueTerms.slice(0, commaIndex).join(' ');
          let lastName = valueTerms.slice(commaIndex).join(' ');

          // Add leading wildcard for non-null first and last names
          firstName = firstName ? `*${firstName}` : firstName;
          lastName = lastName ? `*${lastName}` : lastName;

          // Consider first, last ordering and last, first ordering with trailing wildcard
          fuzzyFilters += `(${ldapKey}=${firstName}*, ${lastName}*)`;
          fuzzyFilters += `(${ldapKey}=${lastName}*, ${firstName}*)`;
        });

        return fuzzyFilters;
      }
      case 'filter[officePhoneNumber][fuzzy]':
      case 'filter[alternatePhoneNumber][fuzzy]':
      case 'filter[faxNumber][fuzzy]':
      case 'filter[officeAddress][fuzzy]': {
        return `${ldapKey}=*${value}*`;
      }
      case 'filter[phoneNumber][fuzzy]': {
        return `|(${ldapKey}=*${value}*)(${keyMap['filter[alternatePhoneNumber]']}=*${value}*)`
          + `(${keyMap['filter[faxNumber]']}=*${value}*)`;
      }
      case 'filter[primaryAffiliation]': {
        return `${ldapKey}=${_.invert(primaryAffiliationMap)[value]}`;
      }
      default: {
        return defaultOperation;
      }
    }
  };

  let ldapQuery = '';
  _.forEach(endpointQuery, (value, key) => {
    if (keyMap[key]) ldapQuery += `(${valueOperations(key, value)})`;
  });
  if (ldapQuery) ldapQuery = `(&${ldapQuery})`;
  return ldapQuery;
};

/**
 * @summary Return a directory
 * @function
 * @param {string} pathParameter osuUID from query as path parameter
 * @returns {Promise<object>} Promise object represents a serialized directory resource
 */
const getDirectory = (pathParameter) => new Promise((resolve, reject) => {
  const client = getClient();
  client.promiseSearch = util.promisify(client.search);
  client.promiseSearch('o=orst.edu', { filter: `osuUID=${pathParameter}`, scope: 'sub' }).then((res) => {
    res.on('searchEntry', (entry) => {
      resolve(serializeDirectory(entry.object));
    });
    res.on('error', (error) => {
      reject(error);
    });
    res.on('end', () => {
      resolve(undefined);
    });
  }).catch((error) => {
    reject(error);
  });
});

/**
 * @summary Return a list of directories
 * @function
 * @param {object} endpointQuery endpointQuery query object in terms of API query params
 * @returns {Promise<object>} Promise object represents a serialized list of directory resources,
 *   or undefined array if query is empty
 */
const getDirectories = (endpointQuery) => new Promise((resolve, reject) => {
  const ldapQuery = mapQuery(endpointQuery);
  if (!ldapQuery) {
    resolve(undefined);
  } else {
    const client = getClient();
    client.promiseSearch = util.promisify(client.search);
    const searchResults = [];
    client.promiseSearch('o=orst.edu', { filter: ldapQuery, scope: 'sub' }).then((res) => {
      res.on('searchEntry', (entry) => {
        searchResults.push(entry.object);
      });
      res.on('error', (error) => {
        reject(error);
      });
      res.on('end', () => {
        resolve(serializeDirectories(searchResults, endpointQuery));
      });
    }).catch((error) => {
      reject(error);
    });
  }
});

export { getDirectory, getDirectories };
