from dash import Dash, dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
from datetime import datetime, timedelta
from server import app  # นำเข้า Flask app จาก server.py
import models

# สร้าง Dash app โดยใช้ Flask server จาก server.py
dash_app = Dash(__name__, server=app, url_base_pathname='/dash/')

# Define the layout of the Dash app
dash_app.layout = html.Div([
    dcc.Graph(id='pm25-graph'),
    dcc.Interval(
        id='interval-component',
        interval=60*1000,  # Update every minute
        n_intervals=0
    )
])

# Define the callback to update the graph
@dash_app.callback(Output('pm25-graph', 'figure'),
              [Input('interval-component', 'n_intervals')])
def update_graph(n):
    # ดึงข้อมูลทั้งหมดจากฐานข้อมูล
    predictions = models.PM25Prediction.query.all()

    # กรองข้อมูลเฉพาะ 7 วันที่ผ่านมา (ตัวอย่าง)
    seven_days_ago = datetime.now() - timedelta(days=7)
    filtered_predictions = [p for p in predictions if p.timestamp >= seven_days_ago]

    # จัดเตรียมข้อมูลสำหรับกราฟ
    prediction_data = {
        "time": [p.timestamp for p in filtered_predictions],
        "values": [p.predicted_value for p in filtered_predictions]
    }

    # สร้างกราฟ
    figure = {
        'data': [
            go.Scatter(
                x=prediction_data['time'],
                y=prediction_data['values'],
                mode='lines+markers',
                name='PM2.5 Prediction'
            )
        ],
        'layout': {
            'title': 'PM2.5 Prediction (Last 7 Days)',
            'xaxis': {
                'title': 'Time',
                'type': 'date',  # ตั้งค่าแกนเวลาเป็นประเภทวันที่
                'tickformat': '%Y-%m-%d %H:%M'  # รูปแบบการแสดงผลเวลา
            },
            'yaxis': {
                'title': 'PM2.5 (µg/m³)'
            },
            'hovermode': 'x unified'  # แสดงข้อมูลเมื่อ hover
        }
    }
    return figure