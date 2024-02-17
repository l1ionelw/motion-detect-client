import threading

import flask
import pandas as panda
import cv2
import time
from flask import Flask

app = Flask(__name__)

initialState = None
pass_idx = None
dataFrame = None
var_motion = None

stop_program = False
ml_active = False

prev_var_motion = None


def analyze():
    global initialState, pass_idx, var_motion, stop_program, initialState, dataFrame, ml_active, prev_var_motion
    ml_active = True
    initialState = None
    dataFrame = panda.DataFrame(columns=["Initial", "Final"])
    video = cv2.VideoCapture(0)
    pass_idx = 0
    prev_var_motion = -1
    var_motion = -1
    while True:
        check, cur_frame = video.read()
        var_motion = 0
        gray_image = cv2.cvtColor(cur_frame, cv2.COLOR_BGR2GRAY)
        gray_frame = cv2.GaussianBlur(gray_image, (21, 21), 0)

        if initialState is None:
            initialState = gray_frame
            continue

        differ_frame = cv2.absdiff(initialState, gray_frame)
        thresh_frame = cv2.threshold(differ_frame, 30, 255, cv2.THRESH_BINARY)[1]
        thresh_frame = cv2.dilate(thresh_frame, None, iterations=2)
        cont, _ = cv2.findContours(thresh_frame.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cur in cont:
            if cv2.contourArea(cur) < 10000:
                continue

            var_motion = 1
            (cur_x, cur_y, cur_w, cur_h) = cv2.boundingRect(cur)
            cv2.rectangle(cur_frame, (cur_x, cur_y), (cur_x + cur_w, cur_y + cur_h), (0, 255, 0), 3)

        cv2.imshow("Gray Frame", gray_frame)
        cv2.imshow("Diff Frame", differ_frame)
        cv2.imshow("Threshold Frame", thresh_frame)
        cv2.imshow("Color Frame", cur_frame)
        wait_key = cv2.waitKey(1)

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
            exit(0)

        time.sleep(0.5)

    # dataFrame.to_csv("EachMovement.csv")


@app.route("/")
def index():
    return flask.jsonify({"motion": var_motion})


@app.route("/stop")
def stop():
    global stop_program, var_motion
    stop_program = True
    var_motion = None
    return flask.jsonify({"stop_program": stop_program})


@app.route("/start")
def start_analyze():
    global stop_program
    stop_program = False
    if ml_active:
        print("already starting up")
        return flask.jsonify({"status": "waiting"})
    threading.Thread(target=analyze).start()
    return flask.jsonify({"stop_program": stop_program, "status": "starting"})


if __name__ == '__main__':
    ml = threading.Thread(target=analyze)
    ml.start()
    app.run(host="98.42.152.32", port=2500)
