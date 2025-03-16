from server import app  # นำเข้า Flask app จาก server.py
from flask import render_template, request, jsonify
import models
import forms
import utils
from dash_app import dash_app  # นำเข้า Dash app จาก dash_app.py

# เส้นทางหลัก
@app.route("/")
def index():
    return render_template("index.html")

# เส้นทางสำหรับ PM25
@app.route("/pm25")
def pm25():
    return render_template("pm25.html")

# API สำหรับดึงข้อมูล PM2.5
@app.route("/api/pm25/<sensor_id>")
def get_pm25(sensor_id):
    # ดึงค่าฝุ่น PM2.5 ที่ทำนายไว้จากฐานข้อมูล
    prediction = models.PM25Prediction.query.filter_by(sensor_id=sensor_id).first()
    if prediction:
        return jsonify({
            "sensor_id": prediction.sensor_id,
            "predicted_value": prediction.predicted_value,
            "timestamp": prediction.timestamp
        })
    else:
        return jsonify({"error": "Sensor not found"}), 404

# เส้นทางสำหรับทำนายค่า PM2.5
@app.route("/predict", methods=["POST"])
def predict():
    sensor_id = request.form.get("sensor_id")
    predicted_value = utils.get_predicted_pm25(sensor_id)
    return jsonify({"predicted_value": predicted_value})

# เส้นทางสำหรับแสดงผลการทำนาย
@app.route("/prediction")
def prediction():
    predictions = models.PM25Prediction.query.all()
    prediction_data = {
        "time": [p.timestamp for p in predictions],
        "values": [p.predicted_value for p in predictions]
    }
    return render_template("prediction.html", prediction_data=prediction_data)

if __name__ == "__main__":
    app.run(debug=True)