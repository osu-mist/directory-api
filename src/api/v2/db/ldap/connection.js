import config from 'config';
import ldap from 'ldapjs';

const { url, dn, password } = config.get('dataSources.ldap');

/**
 * @summary Get an ldap connection
 * @function
 * @returns {Promise<object>} Promise that resolves to ldap client after bind
 */
let clientInstance = null;
let bindingPromise = null;

/**
 * @summary Get an ldap connection
 * @function
 * @returns {Promise<object>} Promise that resolves to ldap client after bind
 */
const getClient = () => {
  if (clientInstance && clientInstance.connected) {
    return Promise.resolve(clientInstance);
  }

  if (bindingPromise) {
    return bindingPromise;
  }

  bindingPromise = new Promise((resolve, reject) => {
    // Validate configuration
    if (!dn || !password) {
      const configError = new Error('LDAP DN or password not configured');
      // eslint-disable-next-line no-console
      console.error('LDAP configuration error:', configError);
      bindingPromise = null;
      reject(configError);
      return;
    }

    const client = ldap.createClient({ url });
    let bindCompleted = false;
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      bindingPromise = null;
    };

    // Handle connection errors
    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('LDAP connection error:', err);
      if (!bindCompleted) {
        cleanup();
        client.unbind(() => {
          reject(err);
        });
      } else {
        // If error occurs after bind, invalidate the instance
        clientInstance = null;
      }
    });

    client.on('close', () => {
      clientInstance = null;
    });

    client.on('end', () => {
      clientInstance = null;
    });

    // Set timeout for bind operation
    timeoutId = setTimeout(() => {
      if (!bindCompleted) {
        const timeoutError = new Error('LDAP bind timeout');
        cleanup();
        client.unbind(() => {
          reject(timeoutError);
        });
      }
    }, 10000); // 10 second timeout

    // Bind immediately
    client.bind(dn, password, (err) => {
      bindCompleted = true;
      cleanup();

      if (err) {
        // eslint-disable-next-line no-console
        console.error('LDAP bind error:', err);
        client.unbind(() => {
          reject(err);
        });
      } else {
        clientInstance = client;
        clientInstance.connected = true;
        resolve(client);
      }
    });
  });

  return bindingPromise;
};

/**
 * @summary Validate ldap connection and throw an error if invalid
 * @function
 * @throws Throws an error if unable to connect or search ldap
 */
const validateLdap = async () => {
  try {
    const client = await getClient();
    client.unbind();
  } catch (err) {
    throw new Error('Invalid LDAP configuration');
  }
};

export { getClient, validateLdap };
