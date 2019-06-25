import subprocess
import json
import requests
import time
from datetime import datetime, timedelta

# Get 'Now' represented as YYYYMMDDHHMM
NOW = time.strftime('%Y%m%d%H%M')

n_days = 2
date_n_days_ago = datetime.now() - timedelta(days = n_days)
FROM = date_n_days_ago.strftime('%Y%m%d%H%M')


# proc = subprocess.Popen(["curl", "-X", "POST", "-u", "muntadher.alzayer@colorado.edu:BigDataSpring2018", "https://gnip-api.twitter.com/search/fullarchive/accounts/greg-students/prod.json", "-d", """{"query":"weather","maxResults":"500","fromDate":"201801011200","toDate":"201801051200"}"""], stdout=subprocess.PIPE)
# (out, err) = proc.communicate()
# out = json.loads(out)

# data = '{"query": "weather", "fromDate": "201804201200", "maxResults": "500", "toDate": "201804251200"}'
# headers = json.dumps("{'Authorization': 'Basic bXVudGFkaGVyLmFsemF5ZXJAY29sb3JhZG8uZWR1OkJpZ0RhdGFTcHJpbmcyMDE4'}")
# url = 'https://gnip-api.twitter.com/search/fullarchive/accounts/greg-students/prod.json'
# requests.post(url, data = data, headers = headers)

def get_data(query, fromDate, toDate, maxResults):
    # '{"query": "weather", "fromDate": "201804051200", "maxResults": "500", "toDate": "201804251200"}'
    data = '{"query": "%s", "fromDate": "%s", "maxResults": "%s", "toDate": "%s"}'
    data = data % (query, fromDate, toDate, maxResults)
    headers = {"Authorization": "Basic bXVudGFkaGVyLmFsemF5ZXJAY29sb3JhZG8uZWR1OkJpZ0RhdGFTcHJpbmcyMDE4"}

    url = 'https://gnip-api.twitter.com/search/fullarchive/accounts/greg-students/prod.json'

    r = requests.post(url, data = data, headers = headers)
    if not(r.status_code == 200):
        print ("Encountered Error with Request: ", r.status_code)
        return

    tweets = r.json()
    return tweets

if __name__ == "__main__":
    get_data("mars", FROM, 20, NOW)
