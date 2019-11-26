import _ from 'lodash';

import { errorHandler, errorBuilder } from 'errors/errors';

import { getDirectories } from '../db/ldap/directory-dao';

/**
 * @summary Get directory
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<object>} response
 */
const get = async (req, res) => {
  try {
    const params = req.query;
    const paramKeys = _.keys(params);
    let errors = [];
    if (paramKeys.includes('primaryAffiliation') && paramKeys.length === 3) {
      errors.push('primaryAffiliation may not be used as a lone query parameter.');
    }

    const valuelessParams = _.pickBy(params, (value) => !value && value !== 0);
    const generateErrorString = (accumulator, value, key) => {
      accumulator.push(`Query parameter '${key}' must have a value.`);
      return accumulator;
    };
    const emptyValueErrors = _.reduce(valuelessParams, generateErrorString, []);
    errors = _.concat(errors, emptyValueErrors);
    if (!_.isEmpty(errors)) {
      return errorBuilder(res, 400, errors);
    }

    const result = await getDirectories(params);
    if (!result) {
      return errorBuilder(res, 400, ['No query parameters specified.']);
    }
    return res.send(result);
  } catch (err) {
    const ldeMessage = err.lde_message;
    if (ldeMessage) {
      if (ldeMessage.includes('Size Limit Exceeded')) {
        return errorBuilder(res, 400, ['Size Limit Exceeded (search too broad)']);
      }
      return errorHandler(res, [ldeMessage]);
    }
    return errorHandler(res, err);
  }
};

export { get };
