const config = require('config');
const ldap = require('ldapjs');

const { url } = config.get('dataSources.ldap');

/**
 * @summary Get an ldap connection
 * @function
 * @returns {object} ldap client connection object
 */
const getClient = () => ldap.createClient({ url });

/**
 * @summary Validate ldap connection and throw an error if invalid
 * @function
 * @throws Throws an error if unable to connect or search ldap
 */
const validateLdap = async () => {
  try {
    const client = ldap.createClient({ url }).on('error', () => {
      throw new Error('Error connecting to ldap');
    }).on('connect', () => {
      client.destroy();
    });
  } catch (err) {
    throw new Error('Invalid LDAP url');
  }
};

module.exports = { getClient, validateLdap };
