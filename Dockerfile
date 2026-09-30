FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY brain.py server.py train.py ./
COPY static ./static
RUN useradd --create-home fly && mkdir -p /data/sessions && chown -R fly /data
USER fly

ENV FLY_DATA_DIR=/data/sessions
VOLUME /data
EXPOSE 8000

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "server:app"]
