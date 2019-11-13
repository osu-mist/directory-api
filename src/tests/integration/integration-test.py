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
    def test_get_directory(self, endpoint='/directory'):
        tests = {}
        test_cases = self.test_cases
        for param in test_cases:
            if param != 'id':
                tests[param] = test_cases[param]
                for test in test_cases[param]:
                    tests[param][test] = test_cases[param][test]

        for query_param in tests:
            utils.test_query_params(self, endpoint, query_param,
                                    tests[query_param]['valid'],
                                    tests[query_param]['invalid'])

    # Test GET /directory/{osuUid}
    def test_get_directory_by_id(self, endpoint='/directory'):
        valid_ids = self.test_cases['id']['valid']
        invalid_ids = self.test_cases['id']['invalid']
        for valid_id in valid_ids:
            test_url = f'{endpoint}/{valid_id}'
            response = utils.test_endpoint(self, test_url, DIR_RES, 200)
            response_data = response.json()['data']
            self.assertEqual(valid_id, response_data['id'])
            self.assertEqual(valid_id, response_data['attributes']['osuUid'])
        for invalid_id in invalid_ids:
            test_url = f'{endpoint}/{invalid_id}'
            utils.test_endpoint(self, test_url, ERR_OBJ, 404)

    # Test pagination
    def test_get_directories_pagination(self, endpoint='/directory'):
        testing_paginations = [
            {'number': 1, 'size': 25, 'expected_status_code': 200},
            {'number': 1, 'size': None, 'expected_status_code': 200},
            {'number': None, 'size': 25, 'expected_status_code': 200},
            {'number': 999, 'size': 1, 'expected_status_code': 200},
            {'number': -1, 'size': 25, 'expected_status_code': 400},
            {'number': 1, 'size': -1, 'expected_status_code': 400},
            {'number': 1, 'size': 501, 'expected_status_code': 400}
        ]
        nullable_fields = []
        for pagination in testing_paginations:
            params = {'lastName': 'Wilson'}
            for k in ['number', 'size']:
                if pagination[k] is not None:
                    params[f'page[{k}]'] = pagination[k]
                else:
                    params[f'page[{k}]'] = 1 if k == 'number' else 25
            expected_status_code = pagination['expected_status_code']
            resource = DIR_RES if expected_status_code == 200 else ERR_OBJ
            response = utils.test_endpoint(self, endpoint, resource,
                                           expected_status_code,
                                           query_params=params,
                                           nullable_fields=nullable_fields)
            content = utils.get_json_content(self, response)
            if expected_status_code == 200:
                try:
                    meta = content['meta']
                    num = pagination['number'] if pagination['number'] else 1
                    size = pagination['size'] if pagination['size'] else 25
                    self.assertEqual(num, meta['currentPageNumber'])
                    self.assertEqual(size, meta['currentPageSize'])
                except KeyError as error:
                    self.fail(error)


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
