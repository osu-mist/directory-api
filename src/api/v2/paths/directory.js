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
    const result = await getDirectories(req.query);
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