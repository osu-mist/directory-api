const appRoot = require('app-root-path');

const { serializeDirectories, serializeDirectory } = require('../../serializers/directory-serializer');

const { openapi } = appRoot.require('utils/load-openapi');
const conn = appRoot.require(`api/${openapi.basePath}/db/ldap/connection`);

/**
 * @summary Map endpoint query to ldap query
 * @function
 * @returns {string} string representing search filter for ldap query
 */
const mapQuery = (endpointQuery) => {
  const keyMap = new Map([
    ['fuzzyName', 'cn'],
    ['lastName', 'sn'],
    ['firstName', 'givenName'],
    ['primaryAffiliation', 'osuPrimaryAffiliation'],
    ['onid', 'uid'],
    ['emailAddress', 'mail'],
    ['officePhoneNumber', 'telephoneNumber'],
    ['alternatePhoneNumber', 'osuAltPhoneNumber'],
    ['faxNumber', 'facsimileTelephoneNumber'],
    ['phoneNumber', 'telephoneNumber'],
    ['officeAddress', 'osuOfficeAddress'],
    ['department', 'osuDepartment'],
  ]);

  const keyOperations = (key, value) => {
    switch (key) {
      case 'firstName': {
        return `${keyMap.get(key)}=${value}*`;
      }
      case 'fuzzyName': {
        let fuzzyFilters = '|'; // 'or' condition for all name orderings
        const valueTerms = value.split(/[ ,]+/);

        // Loop through possible splits of query into first and last names
        for (let commaIndex = 1; commaIndex <= valueTerms.length; commaIndex += 1) {
          let firstName = '*';
          let lastName = '*';
          for (let i = 0; i < commaIndex; i += 1) firstName += `${valueTerms[i]} `;
          for (let i = commaIndex; i < valueTerms.length; i += 1) lastName += `${valueTerms[i]} `;
          // Consider first, last ordering and last, first ordering
          fuzzyFilters += `(${keyMap.get(key)}=${firstName.slice(0, -1)}*, ${lastName.slice(0, -1)}*)`;
          fuzzyFilters += `(${keyMap.get(key)}=${lastName.slice(0, -1)}*, ${firstName.slice(0, -1)}*)`;
        }
        return fuzzyFilters;
      }
      case 'lastName': {
        return `${keyMap.get(key)}=${value}*`;
      }
      case 'phoneNumber': {
        return `|(${keyMap.get(key)}=*${value}*)(${keyMap.get('alternatePhoneNumber')}=*${value}*)`
          + `(${keyMap.get('faxNumber')}=*${value}*)`;
      }
      case 'primaryAffiliation': {
        return `${keyMap.get(key)}=${new Map([
          ['Student', 'S'],
          ['Employee', 'E'],
          ['Other', 'O'],
          ['Retiree', 'R'],
          ['Unknown', 'U'],
        ]).get(value)}`;
      }
      default: {
        return `${keyMap.get(key)}=*${value}*`;
      }
    }
  };

  let ldapQuery = '(&'; // begin requiring all conditions
  Object.keys(endpointQuery).forEach((key) => {
    if (keyMap.get(key)) ldapQuery += `(${keyOperations(key, endpointQuery[key])})`;
  });
  ldapQuery += ')'; // end requiring all conditions

  return ldapQuery;
};

/**
 * @summary Return a directory
 * @function
 * @returns {Promise} Promise object represents a directory
 */
const getDirectory = pathParameter => new Promise(async (resolve, reject) => {
  const client = conn.getClient();
  client.search('o=orst.edu', { filter: `osuUID=${pathParameter}`, scope: 'sub' }, (err, res) => {
    res.on('searchEntry', (entry) => {
      resolve(serializeDirectory(entry.object));
    });
    res.on('error', (error) => {
      reject(error);
    });
    res.on('end', () => {
      resolve(null);
    });
  });
});

/**
 * @summary Return a list of directories
 * @function
 * @returns {Promise} Promise object represents a list of directories
 */
const getDirectories = endpointQuery => new Promise(async (resolve, reject) => {
  const ldapQuery = mapQuery(endpointQuery);
  if (ldapQuery === '(&)') {
    resolve(null);
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
