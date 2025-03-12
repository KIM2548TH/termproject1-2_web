# PM2.5 Prediction Application

This project is a web application designed to display predicted PM2.5 dust values using Flask. The application provides an interactive interface for users to view and analyze air quality data from various sensors.

## Project Structure

```
pm25-prediction-app
├── src
│   ├── static
│   │   ├── css
│   │   │   └── styles.css
│   │   └── js
│   │       └── scripts.js
│   ├── templates
│   │   ├── base.html
│   │   ├── index.html
│   │   └── prediction.html
│   ├── app.py
│   ├── models.py
│   ├── forms.py
│   └── utils.py
├── requirements.txt
└── README.md
```

## Features

- **Interactive Map**: Users can select sensors on a map to view real-time PM2.5 predictions.
- **Detailed Predictions**: Users can access detailed predictions for selected sensors, including visualizations of trends.
- **User-Friendly Interface**: The application is designed with a clean and intuitive interface for easy navigation.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd pm25-prediction-app
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Run the application:
   ```
   python src/app.py
   ```

2. Open your web browser and navigate to `http://127.0.0.1:5000` to access the application.

## Dependencies

The project requires the following Python packages:
- Flask
- Flask-WTF
- Pandas
- NumPy
- Matplotlib
- Any other necessary libraries listed in `requirements.txt`.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.