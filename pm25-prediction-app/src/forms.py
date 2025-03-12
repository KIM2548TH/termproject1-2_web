from flask_wtf import FlaskForm
from wtforms import SelectField, FileField, SubmitField
from wtforms.validators import DataRequired

class SensorSelectionForm(FlaskForm):
    sensor = SelectField('Select Sensor', validators=[DataRequired()])
    submit = SubmitField('Get Prediction')

class UploadCSVForm(FlaskForm):
    file = FileField('Upload CSV File', validators=[DataRequired()])
    submit = SubmitField('Upload')