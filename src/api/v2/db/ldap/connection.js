import config from 'config';
import ldap from 'ldapjs';

const { url, dn, password } = config.get('dataSources.ldap');

/**
 * @summary Get an ldap connection
 * @function
 * @returns {Promise<object>} Promise that resolves to ldap client after bind
 */
const getClient = () => new Promise((resolve, reject) => {
  // Validate configuration
  if (!dn || !password) {
    const configError = new Error('LDAP DN or password not configured');
    // eslint-disable-next-line no-console
    console.error('LDAP configuration error:', configError);
    reject(configError);
    return;
  }

  const client = ldap.createClient({ url });
  let bindCompleted = false;
  let timeoutId = null;

  // Handle connection errors
  client.on('error', (err) => {
    if (!bindCompleted) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      // eslint-disable-next-line no-console
      console.error('LDAP connection error:', err);
      client.unbind(() => {
        reject(err);
      });
    }
  });

  // Set timeout for bind operation
  timeoutId = setTimeout(() => {
    if (!bindCompleted) {
      const timeoutError = new Error('LDAP bind timeout');
      client.unbind(() => {
        reject(timeoutError);
      });
    }
  }, 10000); // 10 second timeout

  // Bind immediately - ldapjs will automatically wait for connection
  // This is the most reliable approach as ldapjs handles connection state internally
  client.bind(dn, password, (err) => {
    bindCompleted = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (err) {
      // eslint-disable-next-line no-console
      console.error('LDAP bind error:', err);
      client.unbind(() => {
        reject(err);
      });
    } else {
      resolve(client);
    }
  });
});

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
