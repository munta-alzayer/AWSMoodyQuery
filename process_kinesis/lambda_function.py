import boto3
import json
import base64
import time

from textblob import TextBlob

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('moodyTable')


def lambda_handler(event, context):
    putItems = []

    for record in event['Records']:
        payload = record['kinesis']['data']
        tweet = json.loads(json.loads(base64.b64decode(payload)))
        #print (tweet)
        testimony = TextBlob(tweet['text'])
        sentiment = testimony.sentiment[0]
        if sentiment > 0.3:
            sentiment = 1
        elif sentiment < -0.3:
            sentiment = -1
        else:
            sentiment = 0

        print (sentiment)
        table.put_item(
            Item={
                'tweetId': tweet['id'],
                'query': 'travel',
                'tweet': tweet['text'],
                'location': tweet['place']['country_code'],
                'sentiment': sentiment,
                'ttl': long(time.time()) + 86400
            }

        )
    return 0
