import instagram_private_api as api
import time
import os
import random

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from instagram_private_api.errors import ClientLoginRequiredError

USERNAME = os.environ['USERNAME']
PASSWORD = os.environ['PASSWORD']
RATE_LIMIT = 0.1


class Client(api.Client):
    rate_limit = RATE_LIMIT
    last_call = time.time()

    def check_rate(self):
        diff = time.time() - self.last_call

        if diff < self.rate_limit:
            sleep = self.rate_limit
            print('Rate limit hit {} s ago, waiting {} s'.format(diff, sleep))
            time.sleep(sleep)

        self.last_call = time.time()

    def username_info(self, *args, **kwargs):
        self.check_rate()

        return super(Client, self).username_info(*args, **kwargs)

    def discover_chaining(self, *args, **kwargs):
        self.check_rate()

        return super(Client, self).discover_chaining(*args, **kwargs)


client = Client(USERNAME, PASSWORD)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="http://localhost.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/info/{username}")
def info(username):
    try:
        user = client.username_info(username)
    except ClientLoginRequiredError as e:
        client.login()
        user = client.username_info(username)
    except Exception as e:
        print('Error occured while getting info')
        print(client, client.settings, USERNAME)

        raise HTTPException(status_code=500, detail=str(e))

    return user['user']


@app.get("/api/suggested/{user_id}")
def suggested(user_id):
    try:
        res = client.discover_chaining(user_id)
    except ClientLoginRequiredError as e:
        client.login()
        res = client.discover_chaining(user_id)
    except Exception as e:
        print('Error occured while getting suggestions')
        print(client, client.settings, USERNAME)

        raise HTTPException(status_code=500, detail=str(e))

    return res['users']
