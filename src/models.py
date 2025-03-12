from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Sensor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    pm25_values = db.relationship('PM25Prediction', backref='sensor', lazy=True)

class PM25Prediction(db.Model):
    __tablename__ = 'pm25_prediction'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensor.id'), nullable=False)
    predicted_value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

def init_app(app):
    db.init_app(app)