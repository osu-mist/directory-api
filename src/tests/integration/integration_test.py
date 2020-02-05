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
            cls.nullable_fields = config['nullable_fields']
            cls.query_params = config['query_params']

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
        test_cases = self.test_cases
        query_params = self.query_params
        nullable_fields = self.nullable_fields
        for query_param in query_params:
            if query_param != 'id':
                param_name = utils.get_query_param_name(query_param)
                utils.test_query_params(self, endpoint, query_param,
                                        test_cases[param_name]['valid'],
                                        test_cases[param_name]['invalid'],
                                        nullable_fields)

    # Test GET /directory/{osuUid}
    def test_get_directory_by_id(self, endpoint='/directory'):
        valid_ids = self.test_cases['id']['valid']
        invalid_ids = self.test_cases['id']['invalid']
        nullable_fields = self.nullable_fields
        for valid_id in valid_ids:
            test_url = f'{endpoint}/{valid_id}'
            response = utils.test_endpoint(self, test_url, DIR_RES, 200,
                                           nullable_fields=nullable_fields)
            response_data = response.json()['data']
            self.assertEqual(valid_id, response_data['id'])
            self.assertEqual(valid_id, response_data['attributes']['osuUid'])
        for invalid_id in invalid_ids:
            test_url = f'{endpoint}/{invalid_id}'
            utils.test_endpoint(self, test_url, ERR_OBJ, 404,
                                nullable_fields=nullable_fields)

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
        nullable_fields = self.nullable_fields
        for pagination in testing_paginations:
            params = {'filter[lastName]': 'Harrison'}
            for k in ['number', 'size']:
                pagination_key = f'page[{k}]'
                if pagination[k] is not None:
                    params[pagination_key] = pagination[k]
                else:
                    params[pagination_key] = 1 if k == 'number' else 25
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
