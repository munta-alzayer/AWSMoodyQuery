from flask import Flask, render_template, request
from boto3.dynamodb.conditions import Key
from params import AWS_SERVER_PUBLIC_KEY, AWS_SERVER_SECRET_KEY
import boto3
import json
import time

app = Flask(__name__)

client = boto3.client('lambda', region_name='us-west-2',
					   aws_access_key_id=AWS_SERVER_PUBLIC_KEY,
					   aws_secret_access_key=AWS_SERVER_SECRET_KEY)
dynamodb = boto3.resource('dynamodb', region_name='us-west-2',
						  aws_access_key_id=AWS_SERVER_PUBLIC_KEY,
						  aws_secret_access_key=AWS_SERVER_SECRET_KEY)

TERM = ""

class Tweet:
	def __init__(self, body, location, sentiment, status):
		self.body = body
		self.location = location
		self.sentiment = sentiment
		self.status = status

# Finds all tweets that match on a given term
def readTable(term, attr='query'):
	global TERM
	TERM = term
	table = dynamodb.Table('moodyTable')
	table.meta.client.get_waiter('table_exists').wait(TableName='moodyTable')
	response = table.query(
		KeyConditionExpression=Key(attr).eq(term)
	)
	if not(response["Items"]):
		# Trigger the fetching of the data
		payload = json.dumps({'term': term})
		response = client.invoke(
			FunctionName='twitter_kinesis',
			InvocationType='RequestResponse',
			LogType='Tail',
			Payload=bytes(payload.encode('utf-8')),
		)
		if not(response['StatusCode'] == 200):
			return {"Error Fetching that data": "Something went wrong"}
		liss = []
		liss.append(Tweet("Fetching that for you...", "Just a second", 0, 0))
		return liss
	return [Tweet(result["tweet"],result["location"],result["sentiment"], 1) for result in response["Items"]]

@app.route("/newdata")
def check_for_new_data(term=TERM, attr='query'):
	global TERM
	table = dynamodb.Table('moodyTable')
	table.meta.client.get_waiter('table_exists').wait(TableName='moodyTable')
	response = {'Items': []}
	
	while not(response['Items']):
		#-----Uncomment Below once Lambda Function is Added------
		#response = table.query(
		#	KeyConditionExpression=Key(attr).eq(term)
		#)
		response = test_func()

	return_tweets = dict([(result["tweet"], result["location"]) for result in response["Items"]])
	return render_template("index.html", term=TERM, tweets=return_tweets)

# Delete this once lambda function is added
def test_func():
	time.sleep(3)
	return {"Items": [{"tweet": "please work", "location": 'US'}]}

@app.route('/')
def renderInit():
	return render_template("index.html")

@app.route('/query', methods=["POST"])
def queryTopic():
	query_term = request.form.get('query')
	results = readTable(query_term) if not (query_term == '') else None
	return render_template("index.html", term=query_term, tweets=results)

if __name__=="__main__":
	app.run()
