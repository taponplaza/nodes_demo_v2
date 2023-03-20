import os
from flask import Flask, render_template, make_response, json, request
from flask_socketio import SocketIO, emit
from random import random
from threading import Lock
from datetime import datetime

# Background Thread

thread = None
thread_lock = Lock()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretKey!'
socketio = SocketIO(app, cors_allowed_origins='*')


# Get current date time

def get_current_datetime():
    now = datetime.now()
    return now.strftime("%H:%M:%S")

# Generate random sequence of dummy sensor values and send it to our clients

def background_thread():
    print("Generating random sensor values")
    while True:
        dummy_sensor_value = round(random() * 40, 3)
        socketio.emit('updateSensorData', {'value': dummy_sensor_value, "date": get_current_datetime()})
        socketio.sleep(750/1000)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route("/get-graph", methods=["POST"])
def get_graph():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "resources", "small_nodes.json")
    data = json.load(open(json_url))

    response = make_response(data, 200)
    return response

@app.route("/event",)
def event():
    return render_template('event.html')

@app.route("/event_2",)
def event_2():
    return render_template('event_2.html')


# Decorator for connect

@socketio.on('connect')
def connect():
    global thread
    print('Client connected')

    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)

# Decorator for disconnect

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected',  request.sid)

if __name__ == '__main__':
    socketio.run(app)