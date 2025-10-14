import config from 'config';
import ldap from 'ldapjs';

const { url, dn, password } = config.get('dataSources.ldap');

/**
 * @summary Get an ldap connection
 * @function
 * @returns {object} ldap client connection object
 */
const getClient = () => {
  const client = ldap.createClient({ url });

  client.bind(dn, password, (err) => {
    if (err) {
      console.error('LDAP bind error:', err);
      client.unbind();
    }
  });

  return client;
};

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

export { getClient, validateLdap };
