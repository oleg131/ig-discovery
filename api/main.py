import instagram_private_api as api
import time
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


USERNAME = os.environ['USERNAME']
PASSWORD = os.environ['PASSWORD']

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5000",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT = 0.1


class Client(api.Client):
    rate_limit = RATE_LIMIT
    last_call = time.time()

    def check_rate(self):
        diff = time.time() - self.last_call

        if diff < self.rate_limit:
            sleep = self.rate_limit - diff
            print('Rate limit hit, waiting {} s'.format(sleep))
            time.sleep(sleep)

        self.last_call = time.time()

    def username_info(self, *args, **kwargs):
        self.check_rate()

        return super().username_info(*args, **kwargs)

    def discover_chaining(self, *args, **kwargs):
        self.check_rate()

        return super().discover_chaining(*args, **kwargs)


client = Client(username, password)


@app.get("/info/{username}")
def info(username):
    user = client.username_info(username)

    return user['user']


@app.get("/suggested/{user_id}")
def read_item(user_id):
    try:
        res = client.discover_chaining(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return res['users']
