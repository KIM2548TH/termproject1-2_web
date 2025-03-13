from dash import Dash, dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
from flask import Flask
import models

# Create a Flask server
server = Flask(__name__)
server.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pm25.db"
server.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
models.init_app(server)

# Create a Dash app
app = Dash(__name__, server=server, url_base_pathname='/dash/')

# Define the layout of the Dash app
app.layout = html.Div([
    dcc.Graph(id='pm25-graph'),
    dcc.Interval(
        id='interval-component',
        interval=60*1000,  # Update every minute
        n_intervals=0
    )
])

# Define the callback to update the graph
@app.callback(Output('pm25-graph', 'figure'),
              [Input('interval-component', 'n_intervals')])
def update_graph(n):
    predictions = models.PM25Prediction.query.all()
    prediction_data = {
        "time": [p.timestamp for p in predictions],
        "values": [p.predicted_value for p in predictions]
    }

    figure = {
        'data': [
            go.Scatter(
                x=prediction_data['time'],
                y=prediction_data['values'],
                mode='lines+markers'
            )
        ],
        'layout': {
            'title': 'PM2.5 Prediction'
        }
    }
    return figure

if __name__ == '__main__':
    app.run_server(debug=True)