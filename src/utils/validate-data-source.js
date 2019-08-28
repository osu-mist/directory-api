import _ from 'lodash';
import config from 'config';
import { validateLdap as ldap } from 'api/v2/db/ldap/connection';

const { dataSources } = config.get('dataSources');

const { logger } = require('./logger');

/** Validate database configuration */
const validateDataSource = () => {
  const validationMethods = {
    ldap,
  };

  _.each(dataSources, (dataSourceType) => {
    if (dataSourceType in validationMethods) {
      validationMethods[dataSourceType]().catch((err) => {
        logger.error(err);
        process.exit(1);
      });
    } else {
      throw new Error(`Data source type: '${dataSourceType}' is not recognized.`);
    }
  });
};

export { validateDataSource };
