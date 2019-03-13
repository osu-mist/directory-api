#!/usr/bin/env python2
# encoding: utf-8

import unittest, sys, json, math, operator, requests

class gateway_tests(unittest.TestCase):
    def setUp(self):
        global access_token
        global request_url
        self.access_token = access_token
        self.url = request_url

    def _request(self, path, verb="get", access_token=None, **params):
        url = self.url.rstrip("/")
        if path:
            url += "/" + path.lstrip("/")
        if access_token is None:
            access_token = self.access_token
        headers = {'Authorization': access_token}
        request = requests.request(verb, url, headers=headers, params=params)
        return request

    def test_not_found(self):
        bad_osuuid = "012345678"
        response = self._request(bad_osuuid)
        self.assertEqual(response.status_code, 404)

    def test_overly_broad_search_term(self):
        response = self._request("", q="John")
        self.assertEqual(response.status_code, 400)

    def test_user_not_found_search_term(self):
        bad_name = 'abcdef'
        response = self._request("", q=bad_name)
        self.assertEquals(response.status_code, 200)
        self.assertEqual(response.json()['data'], [])

    def test_user_found_search_term(self):
        response = self._request("", q=config_json["good_name"])
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_user_found_search_term_reversed(self):
        name = config_json["good_name"]
        reversed_name = " ".join(reversed(name.split()))
        response = self._request("", q=reversed_name)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_missing_q_search_term(self):
        response = self._request("")
        self.assertEquals(response.status_code,400)

    def test_no_access_token_search_term(self):
        response = self._request("", access_token="")
        self.assertEquals(response.status_code,401)

    def test_middle_name_search_term(self):
        response = self._request("", q=config_json["middle_cn_search"])
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_partial_mail_search_term(self):
        response = self._request("", q=config_json["partial_email"])
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_sanitize(self):
        good_uid = "browtayl"
        for bad_char in "()*&#":
            response = self._request("", q=good_uid + bad_char)
            self.assertEquals(response.status_code, 200)
            self.assertEquals(response.json()['data'][0]['attributes']['username'], good_uid)

            response = self._request("", q=bad_char + good_uid)
            self.assertEquals(response.status_code, 200)
            self.assertEquals(response.json()['data'][0]['attributes']['username'], good_uid)

    def test_unicode(self):
        unicode_name = 'Vásquez Jiménez'
        response = self._request("", q=unicode_name)
        self.assertEquals(response.status_code, 200)
        json = response.json()
        self.assertGreater(len(json['data']), 0)
        self.assertEquals(response.json()['data'][0]['attributes']['username'], 'vasquald')

    def test_osuuid_found(self):
        good_osuuid = config_json["good_osuuid"]
        response = self._request(good_osuuid)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_osuuid_bad_req_empty(self):
        response = self._request("/")
        self.assertEquals(response.status_code, 400)

    def test_osuuid_bad_req_invalid(self):
        invalid_osuuid = "!@#!@#12dqwd"
        response = self._request(invalid_osuuid)
        self.assertEquals(response.status_code, 404)

    def test_osuuid_no_access_token(self):
        good_osuuid = config_json["good_osuuid"]
        response = self._request(good_osuuid, access_token='')
        self.assertEquals(response.status_code, 401)

if __name__ == '__main__':
    del_list = []

    config_path = None
    for i, option in enumerate(sys.argv):
        if option == '-i':
            config_path = sys.argv[i+1]
            del_list.append(i)
            del_list.append(i+1)

    del_list.reverse()

    for i in del_list:
        del sys.argv[i]

    config_data_file = open(config_path)
    config_json = json.load(config_data_file)

    url = config_json["hostname"] + config_json["version"] + config_json["api"]
    request_url = url

    # Get Access Token
    post_data = {'client_id': config_json["client_id"],
         'client_secret': config_json["client_secret"],
         'grant_type': 'client_credentials'}
    request = requests.post(config_json["token_api"], data=post_data)
    response = request.json()
    access_token = 'Bearer ' + response["access_token"]

    unittest.main()
