
# coding: utf-8

# In[31]:


import boto3
import json
from TwitterAPI import TwitterAPI
from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import csv


# In[34]:



CONSUMER_KEY = ""
CONSUMER_SECRET = ""
ACCESS_TOKEN_KEY = ""
ACCESS_TOKEN_SECRET = ""
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""

f = open('creds.csv');
csv_reader = csv.DictReader(f);
for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        CONSUMER_KEY = row['consumer_key'];
        CONSUMER_SECRET = row['consumer_secret']; 
        ACCESS_TOKEN_KEY = row['access_token_key'];
        ACCESS_TOKEN_SECRET = row['access_token_secret'];
        AWS_ACCESS_KEY_ID = row['aws_access_key_id'];
        AWS_SECRET_ACCESS_KEY = row['aws_secret_access_key'];


# In[35]:


kinesis = boto3.client('kinesis',aws_access_key_id=AWS_ACCESS_KEY_ID,aws_secret_access_key=AWS_SECRET_ACCESS_KEY,region_name='us-west-2')


# In[26]:


count = 0;


# In[36]:


class StdOutListener(StreamListener):
    """ A listener handles tweets that are received from the stream.
    This is a basic listener that just prints received tweets to stdout.
    """
    def on_data(self, data):
        global count;
        #print(data)
        json_load = json.loads(data)
        texts = json_load['text']
        #coded = texts.encode('utf-8')
        s = str(texts)
        #print("Record: ",s);
        if (json_load['place'] is not None and json_load['place']['country_code'] is not None):
            print("User: ",json_load['user']['screen_name']," => Text item: ",data)
            kinesis.put_record(StreamName='moody', Data=json.dumps(data), PartitionKey=json_load['user']['screen_name'])
            count += 1;
            print("Count: ",count);
        return True

    def on_error(self, status):
        print(status)


# In[37]:


if __name__ == '__main__':
    l = StdOutListener()
    auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET)

    stream = Stream(auth, l)
    stream.filter(track=['travel'])
        

