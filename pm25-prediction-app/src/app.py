# webtermclone/pm2.5prompt/pm25-prediction-app/src/app.py
from flask import Flask, render_template, request, jsonify
import models
import forms
import utils

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pm25.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
models.init_app(app)

@app.route("/pm25")
def pm25():
    return render_template("pm25.html")

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

@app.route("/predict", methods=["POST"])
def predict():
    sensor_id = request.form.get("sensor_id")
    predicted_value = utils.get_predicted_pm25(sensor_id)
    return jsonify({"predicted_value": predicted_value})

@app.route("/")
def index():
    return render_template("index.html")

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