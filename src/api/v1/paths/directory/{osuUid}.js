import directoryDao from '../../db/ldap/directory-dao';

import { errorBuilder, errorHandler } from '../../../../errors/errors';
import { openapi: { paths } } from '../../../../utils/load-openapi';

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

export { get };
