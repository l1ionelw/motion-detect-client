import threading

import flask
import pandas as panda
import cv2
import time
from flask import Flask, render_template
from flask_cors import CORS
import logging
import base64

app = Flask(__name__)
log = logging.getLogger('werkzeug')
log.disabled = True
CORS(app)

initialState = None
pass_idx = None
var_motion = None

stop_program = False
ml_active = False

prev_var_motion = None
SENSITIVITY = 4000
renewInitialState = False
cur_frame_bytes = None


def analyze():
    global initialState, pass_idx, var_motion, stop_program, initialState, ml_active, prev_var_motion, SENSITIVITY, renewInitialState, cur_frame_bytes
    print("Starting detection")
    ml_active = True
    initialState = None
    video = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    pass_idx = 0
    prev_var_motion = -1
    var_motion = -1
    while True:
        check, cur_frame = video.read()
        var_motion = 0
        gray_image = cv2.cvtColor(cur_frame, cv2.COLOR_BGR2GRAY)
        gray_frame = cv2.GaussianBlur(gray_image, (21, 21), 0)

        if (initialState is None) or renewInitialState:
            initialState = gray_frame
            renewInitialState = False
            continue

        differ_frame = cv2.absdiff(initialState, gray_frame)
        thresh_frame = cv2.threshold(differ_frame, 30, 255, cv2.THRESH_BINARY)[1]
        thresh_frame = cv2.dilate(thresh_frame, None, iterations=2)
        cont, _ = cv2.findContours(thresh_frame.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cur in cont:
            if cv2.contourArea(cur) < SENSITIVITY:
                continue

            var_motion = 1
            (cur_x, cur_y, cur_w, cur_h) = cv2.boundingRect(cur)
            cv2.rectangle(cur_frame, (cur_x, cur_y), (cur_x + cur_w, cur_y + cur_h), (0, 255, 0), 3)

        cv2.imshow("Gray Frame", gray_frame)
        cv2.imshow("Diff Frame", differ_frame)
        cv2.imshow("Threshold Frame", thresh_frame)
        cv2.imshow("Color Frame", cur_frame)
        wait_key = cv2.waitKey(1)

        ret, cur_frame_bytes = cv2.imencode('.jpg', cur_frame)
        cur_frame_bytes = base64.b64encode(cur_frame_bytes).decode("utf-8")

        if var_motion != prev_var_motion:
            print(f"Change in motion status! Prev: {prev_var_motion} | Current: {var_motion} | Pass #: {pass_idx}")
            prev_var_motion = var_motion
        pass_idx += 1

        if stop_program:
            print("Stopping motion detection thread")
            video.release()
            cv2.destroyAllWindows()
            print("Windows Stopped")
            ml_active = False
            var_motion = None
            prev_var_motion = None
            exit(0)

        time.sleep(0.2)

    # dataFrame.to_csv("EachMovement.csv")


@app.route("/")
def index():
    return flask.jsonify({"motion": var_motion})


@app.route("/stop")
def stop():
    print("Stopping")
    global stop_program, var_motion
    stop_program = True
    var_motion = None
    return flask.jsonify({"stop_program": stop_program})


@app.route("/start")
def start_analyze():
    print("Starting")
    global stop_program
    stop_program = False
    if ml_active:
        print("already starting up")
        return flask.jsonify({"status": "waiting"})
    threading.Thread(target=analyze).start()
    return flask.jsonify({"stop_program": stop_program, "status": "starting"})


@app.route("/image")
def show_image():
    global cur_frame_bytes
    return str(cur_frame_bytes)


@app.route("/renew")
def renewState():
    global renewInitialState
    renewInitialState = True
    return flask.jsonify({"status": "renew state"})

@app.route("/view")
def viewer():
    return render_template("../client/website/index.html")

if __name__ == '__main__':
    app.run(host="98.42.152.32", port=2500)
