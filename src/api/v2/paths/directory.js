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
  const keyMap = {
    'filter[fullName][fuzzy]': 'cn',
    'filter[lastName]': 'sn',
    'filter[firstName]': 'givenName',
    'filter[primaryAffiliation]': 'osuPrimaryAffiliation',
    'filter[onid]': 'uid',
    'filter[emailAddress]': 'mail',
    'filter[officePhoneNumber][fuzzy]': 'telephoneNumber',
    'filter[alternatePhoneNumber][fuzzy]': 'osuAltPhoneNumber',
    'filter[faxNumber][fuzzy]': 'facsimileTelephoneNumber',
    'filter[phoneNumber][fuzzy]': 'telephoneNumber',
    'filter[officeAddress][fuzzy]': 'osuOfficeAddress',
    'filter[department]': 'osuDepartment',
  };

  try {
    let errors = [];
    const params = req.query;
    const valuelessParams = _.pickBy(params, (value, key) => !value && value !== 0 && keyMap[key]);
    const generateErrorString = (accumulator, value, key) => {
      accumulator.push(`Query parameter '${key}' must have a value.`);
      return accumulator;
    };
    errors = _.reduce(valuelessParams, generateErrorString, errors);
    if (!_.isEmpty(errors)) {
      return errorBuilder(res, 400, errors);
    }

    const result = await getDirectories(params);
    if (!result) {
      return errorBuilder(res, 400, ['No non-pagination query parameters specified.']);
    }
    return res.send(result);
  } catch (err) {
    const ldeMessage = err.lde_message;
    if (ldeMessage) {
      if (ldeMessage.includes('Size Limit Exceeded')) {
        return errorBuilder(res, 400, ['Size Limit Exceeded (search too broad)']);
      }
      if (ldeMessage.includes('Time Limit Exceeded')) {
        return errorBuilder(res, 400, ['Request timed out. You are most likely seeing this if '
        + 'your query is too broad, causing a timeout on the database end. Try limiting query to '
        + 'be more specific']);
      }
      return errorHandler(res, [ldeMessage]);
    }
    return errorHandler(res, err);
  }
};

export { get };
