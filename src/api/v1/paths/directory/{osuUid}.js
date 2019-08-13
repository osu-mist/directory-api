const appRoot = require('app-root-path');

const directoryDao = require('../../db/ldap/directory-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get directory
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<object>} response
 */
const get = async (req, res) => {
  try {
    const { osuUid } = req.params;
    const result = await directoryDao.getDirectory(osuUid);
    if (!result) {
      errorBuilder(res, 404, 'A directory with the specified osuUid was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/directory/{osuUid}'].get;

module.exports = { get };
