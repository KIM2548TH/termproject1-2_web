import pandas as pd
import numpy as np

def read_csv(file_path):
    """Reads a CSV file and returns a DataFrame."""
    try:
        data = pd.read_csv(file_path)
        return data
    except Exception as e:
        print(f"Error reading the CSV file: {e}")
        return None


import pandas as pd

# ฟังก์ชันสำหรับการลบ outliers ด้วย IQR
def remove_outliers_iqr(df):
    df["timestamp"] = pd.to_datetime(df["timestamp"], format="mixed")
    df.set_index("timestamp", inplace=True)
    df.drop(columns=["timezone", "Unnamed: 0", "location"], inplace=True, errors="ignore")
    # ลบคอลัมน์ที่ไม่จำเป็น
    columns_to_clean = ["pm_2_5", "pm_10", "pm_2_5sp", "temperature", "humidity"]
    columns_to_clean = [col for col in columns_to_clean if col in df.columns] 
    for col in columns:
        if col in df.columns:  # เช็คว่าคอลัมน์มีอยู่จริง
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            df = df[(df[col] >= Q1 - 1.5 * IQR) & (df[col] <= Q3 + 1.5 * IQR)]
    df.interpolate(method="linear", inplace=True)
    # ปรับขนาดข้อมูลเป็นรายวัน
    df = df.resample("D").mean().fillna(method="ffill")
    return df

def add_lag_features(df):
    lags = [8, 10, 14, 21]  # 1 วัน, 2 วัน, 3 วัน, 7 วัน, 14 วัน (สเกลเป็น 4 ช่วงต่อวัน)
    for lag in lags:
        for col in df.columns:
            df[f"{col}_lag{lag}"] = df[col].shift(lag)
    return df

# ฟังก์ชันสำหรับเพิ่ม Rolling Mean และ Rolling Std ทุกฟีเจอร์
def add_rolling_features(df, shift=7):
    windows = [2, 3, 5, 7, 14]  # 1 วัน, 3 วัน, 7 วัน, 14 วัน
    for window in windows:
        for col in df.columns:
            df[f"{col}_rollmean{window}"] = (
                df[col].shift(shift).rolling(window=window, min_periods=1).mean()
            )
            df[f"{col}_rollstd{window}"] = (
                df[col].shift(shift).rolling(window=window, min_periods=1).std()
            )
    return df

import pandas as pd

def preprocess_data(df):
    # List of expected columns to drop
    expected_columns = ["temperature", "humidity", "pm_2_5_sp", "pm_10"]
    
    for i in df.columns:
        if i in expected_columns:
            df.drop(i, axis=1, inplace=True)
    # Keep only the last 1 year of data
    one_year_ago = df.index.max() - pd.DateOffset(years=2)
    df = df[df.index >= one_year_ago]

    # Set the frequency to daily and fill missing values with backfill
    df = df.asfreq("D").fillna(method="bfill")

    return df

# def calculate_pm25_average(data):
#     """Calculates the average PM2.5 value from the DataFrame."""
#     if data is not None and 'PM2.5' in data.columns:
#         return data['PM2.5'].mean()
#     return None

# def preprocess_data(data):
#     """Preprocesses the data for predictions."""
#     # Example preprocessing steps
#     data.fillna(method='ffill', inplace=True)  # Forward fill missing values
#     return data

# def predict_pm25(model, input_data):
#     """Uses the trained model to predict PM2.5 values based on input data."""
#     processed_data = preprocess_data(input_data)
#     predictions = model.predict(processed_data)
#     return predictions.tolist() if predictions is not None else []