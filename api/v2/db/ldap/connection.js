const config = require('config');
const ldap = require('ldapjs');

const { url } = config.get('dataSources.ldap');

/**
 * @summary Get an ldap connection
 * @function
 * @returns {ldapjs.client} ldap client connection object
 */
const getClient = () => ldap.createClient({ url });

/**
 * @summary Validate ldap connection and throw an error if invalid
 * @function
 * @throws Throws an error if unable to connect or search ldap
 */
const validateLdap = async () => {
  try {
    const client = getClient();
    client.search('o=orst.edu', () => {});
  } catch (err) {
    throw new Error('Error connecting to ldap');
  }
};

module.exports = { getClient, validateLdap };
