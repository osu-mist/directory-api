const appRoot = require('app-root-path');

const directoryDao = require('../db/ldap/directory-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get directory
 */
const get = async (req, res) => {
  try {
    const result = await directoryDao.getDirectories(req.query);
    if (!result) {
      return errorBuilder(res, 400, ['No query parameters specified.']);
    }
    return res.send(result);
  } catch (err) {
    if ('lde_message' in err) {
      if (err.lde_message.includes('Size Limit Exceeded')) {
        return errorBuilder(res, 400, ['Size Limit of 200 Results Exceeded (search too broad)']);
      }
      return errorHandler(res, [err.lde_message]);
    }
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/directory'].get;

module.exports = { get };
