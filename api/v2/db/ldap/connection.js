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
  const client = ldap.createClient({ url }).on('error', () => {
    throw new Error('Error connecting to ldap');
  }).on('connect', () => {
    client.destroy();
  });
};

module.exports = { getClient, validateLdap };
