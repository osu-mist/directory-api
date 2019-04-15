const appRoot = require('app-root-path');

const directoryDao = require('../../db/ldap/directory-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get pet by unique ID
 */
const get = async (req, res) => {
  try {
    const { osuuid } = req.params;
    const result = await directoryDao.getDirectory(osuuid);
    if (!result) {
      errorBuilder(res, 404, 'A directory with the specified UID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/directory/{osuuid}'].get;

module.exports = { get };
