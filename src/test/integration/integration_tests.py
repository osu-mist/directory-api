import unittest, sys, json, math, operator, requests
from api_request import *
import urllib

class gateway_tests(unittest.TestCase):
    def test_not_found(self):
        bad_url = url + "012345678"

        self.assertEqual(basic_request
            (bad_url, access_token).status_code, 404)

    def test_overly_broad_search_term(self):
        response = basic_request(request_url + '?q=John', access_token)
        self.assertEqual(response.status_code, 500)
    
    def test_user_found_search_term(self):
        good_name_url = request_url + '?q=' + urllib.quote(config_json["good_name"])
        response = basic_request(good_name_url, access_token)
        self.assertEquals(response.status_code, 200)

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

    def test_partial_mail_search_term(self):
        partial_mail_url = request_url + "?q=" + urllib.quote(config_json["partial_email"])
        response = basic_request(partial_mail_url, access_token)
        self.assertEquals(response.status_code, 200)

    def test_osuuid_found(self):
        osuuid_url = request_url + "/" + config_json["good_osuuid"]
        response = basic_request(osuuid_url, access_token)
        self.assertEquals(response.status_code, 200)

    def test_osuuid_bad_req(self):
        osuuid_url = request_url + "/" + ""
        response = basic_request(osuuid_url, access_token)
        self.assertEquals(response.status_code, 400)

    def test_osuuid_bad_req(self):
        osuuid_url = request_url + "/" + "!@#!@#12dqwd"
        response = basic_request(osuuid_url, access_token)
        self.assertEquals(response.status_code, 404)

    def test_osuuid_no_acc(self):
        osuuid_url = request_url + "/" + config_json["good_osuuid"]
        response = basic_request(osuuid_url, '')
        self.assertEquals(response.status_code, 401)

if __name__ == '__main__':
    options_tpl = ('-i', 'config_path')
    del_list = []
    
    for i,config_path in enumerate(sys.argv):
        if config_path in options_tpl:
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