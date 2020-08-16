import instagram_private_api as api
import time
import os
import random

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


USERNAME = os.environ['USERNAME']
PASSWORD = os.environ['PASSWORD']
RATE_LIMIT = 0.1

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="http://localhost.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

        return super().username_info(*args, **kwargs)

    def discover_chaining(self, *args, **kwargs):
        self.check_rate()

        return super().discover_chaining(*args, **kwargs)


client = Client(USERNAME, PASSWORD)


@app.get("/api/info/{username}")
def info(username):
    print('Getting info for username {}'.format(username))

    user = client.username_info(username)

    return user['user']


@app.get("/api/suggested/{user_id}")
def read_item(user_id):
    print('Getting suggestions for id {}'.format(user_id))

    try:
        res = client.discover_chaining(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return res['users']
