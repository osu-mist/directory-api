const appRoot = require('app-root-path');

const directoryDao = require('../db/ldap/directory-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get directory
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<object>} response
 */
const get = async (req, res) => {
  try {
    const result = await directoryDao.getDirectories(req.query);
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

get.apiDoc = paths['/directory'].get;

module.exports = { get };
