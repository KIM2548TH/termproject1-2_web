from flask import Flask
import models

# สร้าง Flask app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pm25.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
models.init_app(app)