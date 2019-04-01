const appRoot = require('app-root-path');

const directoryDao = require('../db/ldap/directory-dao');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get directory
 */
const get = async (req, res) => {
  try {
    const result = await directoryDao.getDirectories(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/directory'].get;

module.exports = { get };
