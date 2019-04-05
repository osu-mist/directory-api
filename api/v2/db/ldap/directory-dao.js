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

    client.search('o=orst.edu', {filter: ldapQuery, scope: 'sub'} , function(err,res) {
       res.on('searchEntry', function(entry) {
           resolve(entry.object)
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
      ['q', '|(uid'],   // begin 'or' condition
      ['primaryAffiliation', 'osuPrimaryAffiliation'],
      ['lastName', 'sn'],
      ['emailAddress', 'mail'],
      ['officePhoneNumber', 'telephoneNumber'],
      ['alternatePhoneNumber', ' osuAltPhoneNumber'],
      ['faxNumber', 'facsimileTelephoneNumber'],
      ['phoneNumber', '|(telephoneNumber'],    // begin 'or' condition for any type of number
      ['officeAddress', 'osuOfficeAddress'],
      ['department', 'osuDepartment']
   ]);

   const valueOperations = (key, value) => {
       switch (key) {
           case 'q':
             var q_filters = `*${value}*)(mail=*${value}*)`;
             valueTerms = value.split(/[ ,]+/);
             for (i = 0; i <= valueTerms.length; i++) {
                 var firstName = ''
                 var lastName = ''
                 for (j = 0; j < i; j++) firstName += `${valueTerms[j]} `;
                 for (j = i; j < valueTerms.length; j++) lastName += `${valueTerms[j]} `;
                 q_filters += `(cn=${firstName.slice(0,-1)}*, ${lastName.slice(0,-1)}*)`;
                 q_filters += `(cn=${lastName.slice(0,-1)}*, ${firstName.slice(0,-1)}*)`;
             }
             return q_filters;
           break;

           case 'primaryAffiliation':
             return new Map([
               ['Student', 'S',],
               ['Employee', 'E',],
               ['Other', 'O',],
               ['Retiree', 'R',],
               ['Unknown', 'U',]
             ]).get(value);
           break;

           case 'phoneNumber':
             return `*${value}*)(osuAltPhoneNumber=*${value}*)(facsimileTelephoneNumber=*${value}*)`;
           break;

           default:
             return `*${value}*`;
       }
   }

   var ldapQuery = '(&'    // begin requiring all conditions
   for (const [key, value] of Object.entries(endpointQuery)) {
       ldapQuery += `(${keyMap.get(key)}=${valueOperations(key, value)})`;
   }
   ldapQuery += ')'     // end requiring all conditions

   return ldapQuery;
 }

module.exports = { getDirectories };
