<<<<<<< HEAD:utils/validate-data-source.js
const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { openapi } = appRoot.require('utils/load-openapi');
const { logger } = require('./logger');
=======
import config from 'config';
import _ from 'lodash';
>>>>>>> 389634c25175947adcce13a9b5480702132a3327:src/utils/validate-data-source.js

const { dataSources } = config.get('dataSources');
const awsS3 = dataSources.includes('awsS3')
  ? require('api/v1/db/awsS3/aws-operations').validateAwsS3
  : null;
const json = dataSources.includes('json')
<<<<<<< HEAD:utils/validate-data-source.js
  ? appRoot.require(`/api${openapi.basePath}/db/json/fs-operations`).validateJsonDb
  : null;
const oracledb = dataSources.includes('oracledb')
  ? appRoot.require(`/api${openapi.basePath}/db/oracledb/connection`).validateOracleDb
  : null;
const awsS3 = dataSources.includes('awsS3')
  ? appRoot.require(`/api${openapi.basePath}/db/awsS3/aws-operations`).validateAwsS3
  : null;
const ldap = dataSources.includes('ldap')
  ? appRoot.require(`/api${openapi.basePath}/db/ldap/connection`).validateLdap
=======
  ? require('api/v1/db/json/fs-operations').validateJsonDb
  : null;
const oracledb = dataSources.includes('oracledb')
  ? require('api/v1/db/oracledb/connection').validateOracleDb
>>>>>>> 389634c25175947adcce13a9b5480702132a3327:src/utils/validate-data-source.js
  : null;
const { logger } = require('./logger');

/** Validate database configuration */
const validateDataSource = () => {
  const validationMethods = {
    awsS3,
    http: null, // TODO: add HTTP validation method
    json,
    oracledb,
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

export default validateDataSource;
