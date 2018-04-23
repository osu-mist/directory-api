#!/usr/bin/env python2
# encoding: utf-8

import unittest, sys, json, math, operator, requests
from api_request import basic_request
import urllib

class gateway_tests(unittest.TestCase):
    def test_not_found(self):
        bad_url = request_url + "012345678"
        response = basic_request(bad_url, access_token)
        self.assertEqual(response.status_code, 404)

    def test_overly_broad_search_term(self):
        response = basic_request(request_url + '?q=John', access_token)
        self.assertEqual(response.status_code, 400)

    def test_user_not_found_search_term(self):
        bad_name_url = request_url + '?q=abcdef'
        response = basic_request(bad_name_url, access_token)
        self.assertEquals(response.status_code, 200)
        self.assertEqual(response.json()['data'], [])

    def test_user_found_search_term(self):
        good_name_url = request_url + '?q=' + urllib.quote(config_json["good_name"])
        response = basic_request(good_name_url, access_token)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_user_found_search_term_reversed(self):
        name = config_json["good_name"]
        reversed_name = " ".join(reversed(name.split()))
        good_name_url = request_url + '?q=' + urllib.quote(reversed_name)
        response = basic_request(good_name_url, access_token)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_missing_q_search_term(self):
        response = basic_request(request_url, access_token)
        self.assertEquals(response.status_code,400)

    def test_no_access_token_search_term(self):
        response = basic_request(request_url, '')
        self.assertEquals(response.status_code,401)

    def test_middle_name_search_term(self):
        middle_name_url = request_url + "?q=" + urllib.quote(config_json["middle_cn_search"])
        response = basic_request(middle_name_url, access_token)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_partial_mail_search_term(self):
        partial_mail_url = request_url + "?q=" + urllib.quote(config_json["partial_email"])
        response = basic_request(partial_mail_url, access_token)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_sanitize(self):
        good_uid = "browtayl"
        for bad_char in "()*&#":
            response = basic_request(request_url, access_token, params=dict(q=good_uid + bad_char))
            self.assertEquals(response.status_code, 200)
            self.assertEquals(response.json()['data'][0]['attributes']['username'], good_uid)

            response = basic_request(request_url, access_token, params=dict(q=bad_char + good_uid))
            self.assertEquals(response.status_code, 200)
            self.assertEquals(response.json()['data'][0]['attributes']['username'], good_uid)

    def test_unicode(self):
        unicode_name = 'Hernández'
        response = basic_request(request_url, access_token, params=dict(q=unicode_name))
        self.assertEquals(response.status_code, 200)
        self.assertEquals(response.json()['data'][0]['attributes']['username'], 'hernand2')

    def test_osuuid_found(self):
        osuuid_url = request_url + "/" + config_json["good_osuuid"]
        response = basic_request(osuuid_url, access_token)
        self.assertEquals(response.status_code, 200)
        self.assertNotEqual(response.json()['data'], [])

    def test_osuuid_bad_req_empty(self):
        osuuid_url = request_url + "/" + ""
        response = basic_request(osuuid_url, access_token)
        self.assertEquals(response.status_code, 400)

    def test_osuuid_bad_req_invalid(self):
        osuuid_url = request_url + "/" + "!@#!@#12dqwd"
        response = basic_request(osuuid_url, access_token)
        self.assertEquals(response.status_code, 404)

    def test_osuuid_no_acc(self):
        osuuid_url = request_url + "/" + config_json["good_osuuid"]
        response = basic_request(osuuid_url, '')
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
