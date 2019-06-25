import boto3
import json
from TwitterAPI import TwitterAPI
from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import csv

def lambda_handler(event, context):
    CONSUMER_KEY = ""
    CONSUMER_SECRET = ""
    ACCESS_TOKEN_KEY = ""
    ACCESS_TOKEN_SECRET = ""
    AWS_ACCESS_KEY_ID = ""
    AWS_SECRET_ACCESS_KEY = ""

    f = open('creds.csv')
    csv_reader = csv.DictReader(f)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        CONSUMER_KEY = row['consumer_key']
        CONSUMER_SECRET = row['consumer_secret']
        ACCESS_TOKEN_KEY = row['access_token_key']
        ACCESS_TOKEN_SECRET = row['access_token_secret']
        AWS_ACCESS_KEY_ID = row['aws_access_key_id']
        AWS_SECRET_ACCESS_KEY = row['aws_secret_access_key']

    kinesis = boto3.client('kinesis', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                           region_name='us-west-2')
    auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)

    class StdOutListener(StreamListener):
        """ A listener handles tweets that are received from the stream.
        This is a basic listener that just prints received tweets to stdout.
        """

        def on_data(self, data):
            json_load = json.loads(data)
            texts = json_load['text']
            # coded = texts.encode('utf-8')
            s = str(texts)
            # print("Record: ",s);
            if (json_load['place'] is not None and json_load['place']['country_code'] is not None):
                print("User: ", json_load['user']['screen_name'], " => Text item: ", data)
                kinesis.put_record(StreamName='moody', Data=json.dumps(data),
                                   PartitionKey=json_load['user']['screen_name'])
            return True

        def on_error(self, status):
            print(status)
    l = StdOutListener()
    stream = Stream(auth, l)
    stream.filter(track=['travel'])
    return True
