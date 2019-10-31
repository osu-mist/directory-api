import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils
DIR_RES = 'DirectoryResourceObject'
ERR_OBJ = 'ErrorObject'


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']
            cls.local_test = config['local_test']

        with open(openapi_path) as openapi_file:
            openapi = yaml.load(openapi_file, Loader=yaml.SafeLoader)
            if 'swagger' in openapi:
                backend = 'flex'
            elif 'openapi' in openapi:
                backend = 'openapi-spec-validator'
            else:
                exit('Error: could not determine openapi document version')

        parser = ResolvingParser(openapi_path, backend=backend)
        cls.openapi = parser.specification

    @classmethod
    def cleanup(cls):
        cls.session.close()

    # Test GET /directory
    def test_get_directory_by_id(self, endpoint='/directory'):
        valid_ids = self.test_cases['valid_ids']
        invalid_ids = self.test_cases['invalid_ids']
        for valid_id in valid_ids:
            response = utils.test_endpoint(self, f'{endpoint}/{valid_id}',
                                           DIR_RES, 200)
            actual_id = response.json()['data']['id']
            self.assertEqual(actual_id, valid_id)

        for invalid_id in invalid_ids:
            utils.test_endpoint(self, f'{endpoint}/{invalid_id}', DIR_RES, 404)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)
    integration_tests.cleanup()
