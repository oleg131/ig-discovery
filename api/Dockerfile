FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

COPY main.py requirements.txt /app/

RUN cd /app && pip install -r requirements.txt
