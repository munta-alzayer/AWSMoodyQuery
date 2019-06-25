# This is an old project to be displayed on my personal website muntadharalzayer.com


# Mood_Query

Team members:
- Muntadher AlZayer (Munta)
- Michael Vienneau
- John Welch
- Vibhor Mishra
- Nha Thao Tran (Amanda)

We are working on a sentiment analysis of tweets based on predetermined queries and based on new user searches. Our program will output a map of the world showing the sentiment of Twitter users in their respective areas. 

#Flask 
Used to display the map of the world based on the average sentiment of tweets in each country

#Amazon Web Services utilized:
## AWS Kinesis
To pull tweets from the Twitter Enterprise Search REST API of tweets that contain geolocation

## AWS Lambda
Utilized to run Sentimental Analysis on the tweets and give it a score based on the sentiment of the tweet based on a search query

## AWS DynamoDB
We used the NoSQL database of Dynamodb to handle our already queirized data by using the query keyword as the partition key. The database will then be connected to the front-end display. 
