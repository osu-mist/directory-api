const config = require('config');
const ldapConfig = config.get('dataSources').ldap;

var ldap = require('ldapjs');

/**
 * @summary Return a list of directories
 * @function
 * @returns {Promise} Promise object represents a list of directories
 */
const getDirectories = endpointQuery => new Promise(async (resolve, reject) => {
  try {
    const ldapQuery = mapQuery(endpointQuery);

    var client = ldap.createClient({
      url: ldapConfig.url
    });

    searchResults = [];
    client.search('o=orst.edu', {filter: ldapQuery, scope: 'sub'} , function(err,res) {
       res.on('searchEntry', function(entry) {
         searchResults.push(entry.object);
       });
       res.on('error', function(err) {
         reject(err)
       });
       res.on('end', function(result) {
         resolve(searchResults)
       });
    });

  } catch (err) {
    reject(err);
  }
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
      ['primaryAffiliation', 'osuPrimaryAffiliation'],
      ['onid', 'uid'],
      ['lastName', 'sn'],
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
     ldapQuery += `(${keyOperations(key, value)})`;
   }
   ldapQuery += ')'     // end requiring all conditions

   return ldapQuery;
 }

module.exports = { getDirectories };
