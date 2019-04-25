const appRoot = require('app-root-path');
const config = require('config');

const { serializeDirectories, serializeDirectory } = require('../../serializers/directory-serializer');

const { openapi } = appRoot.require('utils/load-openapi');
const conn = appRoot.require(`api/${openapi.basePath}/db/ldap/connection`);

/**
 * @summary Return a directory
 * @function
 * @returns {Promise} Promise object represents a directory
 */
const getDirectory = pathParameter => new Promise(async (resolve, reject) => {
  var client = conn.getClient();
  client.search('o=orst.edu', {filter: `osuUID=${pathParameter}`, scope: 'sub'} , function(err,res) {
     res.on('searchEntry', function(entry) {
       resolve(serializeDirectory(entry.object));
     });
     res.on('error', function(err) {
       reject(err);
     });
     res.on('end', function(result) {
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

  var client = conn.getClient();

  searchResults = [];
  client.search('o=orst.edu', {filter: ldapQuery, scope: 'sub'} , function(err,res) {
     res.on('searchEntry', function(entry) {
       searchResults.push(entry.object);
     });
     res.on('error', function(error) {
       reject(error);
     });
     res.on('end', function(result) {
       resolve(serializeDirectories(searchResults, endpointQuery));
     });
  });
});

/**
 * @summary Map endpoint query to ldap query
 * @function
 * @returns {string} string representing search filter for ldap query
 */
 const mapQuery = (endpointQuery) => {
   const endpointQueryObject = {
     primaryAffiliation,
     lastName,
     emailAddress,
     officePhoneNumber,
     alternatePhoneNumber,
     faxNumber,
     officeAddress,
     department
   } = endpointQuery;

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
      ['department', 'osuDepartment']
   ]);

   const keyOperations = (key, value) => {
       switch (key) {
         case 'firstName':
            return `${keyMap.get(key)}=${value}*`;
         case 'lastName':
            return `${keyMap.get(key)}=${value}*`;
         case 'fuzzyName':
           var fuzzy_filters = '|';   // 'or' condition for all name orderings
           valueTerms = value.split(/[ ,]+/);

           // Loop through possible splits of query into first and last names
           for (commaIndex = 1; commaIndex <= valueTerms.length; commaIndex++) {
             var firstName = '*';
             var lastName = '*';
             for (i = 0; i < commaIndex; i++) firstName += `${valueTerms[i]} `;
             for (i = commaIndex; i < valueTerms.length; i++) lastName += `${valueTerms[i]} `;
             // Consider first, last ordering and last, first ordering
             fuzzy_filters += `(${keyMap.get(key)}=${firstName.slice(0,-1)}*, ${lastName.slice(0,-1)}*)`;
             fuzzy_filters += `(${keyMap.get(key)}=${lastName.slice(0,-1)}*, ${firstName.slice(0,-1)}*)`;
           }
           return fuzzy_filters;
         break;

           case 'primaryAffiliation':
             return `${keyMap.get(key)}=${new Map([
               ['Student', 'S',],
               ['Employee', 'E',],
               ['Other', 'O',],
               ['Retiree', 'R',],
               ['Unknown', 'U',]
             ]).get(value)}`;
           break;

           case 'phoneNumber':
             return `|(${keyMap.get(key)}=*${value}*)(${keyMap.get('alternatePhoneNumber')}=*${value}*)` +
                    `(${keyMap.get('faxNumber')}=*${value}*)`;
           break;

           default:
             return `${keyMap.get(key)}=*${value}*`;
       }
   }

   var ldapQuery = '(&'    // begin requiring all conditions
   for (const [key, value] of Object.entries(endpointQuery)) {
     if (keyMap.get(key)) ldapQuery += `(${keyOperations(key, value)})`;
   }
   ldapQuery += ')'     // end requiring all conditions

   return ldapQuery;
 }

module.exports = { getDirectory, getDirectories };
