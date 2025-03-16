from dash import Dash, dcc, html
from dash.dependencies import Input, Output, State
import plotly.graph_objs as go
from datetime import datetime, timedelta
from server import app  # นำเข้า Flask app จาก server.py
import models
import utils  # เพิ่มการนำเข้า utils
import os
import pandas as pd
from flask import request
import glob
import json
from urllib.parse import parse_qs

# เพิ่มฟังก์ชันสำหรับการดีบัก
def debug_log(message):
    """บันทึกข้อความดีบักลงในไฟล์และแสดงในคอนโซวลความ"""
    print(f"[DEBUG] {message}")
    with open("dash_debug.log", "a", encoding="utf-8") as f:
        f.write(f"{datetime.now()}: {message}\n")

# สร้าง Dash app โดยใช้ Flask server จาก server.py
dash_app = Dash(__name__, server=app, url_base_pathname='/dash/')

# Define the layout of the Dash app
dash_app.layout = html.Div([
    dcc.Location(id='url', refresh=False),  # รับค่า URL parameter
    dcc.Store(id='selected-station', storage_type='memory'),  # เก็บสถานีที่ถูกเลือก
    dcc.Graph(id='feature-graph', style={'backgroundColor': '#333'}),
    dcc.Interval(id='interval-component', interval=60*1000, n_intervals=0)
], style={'backgroundColor': '#333', 'padding': '15px', 'borderRadius': '10px'})

# ฟังก์ชันสำหรับค้นหาไฟล์ CSV
def find_csv_file(station_name):
    """ค้นหาไฟล์ CSV ที่เกี่ยวข้องกับสถานีที่ระบุ"""
    debug_log(f"ค้นหาไฟล์ CSV สำหรับสถานี: {station_name}")
    
    # แก้ไขชื่อไฟล์ให้ถูกต้อง
    if not station_name.endswith('-1h'):
        station_filename = f"{station_name}-1h"
    else:
        station_filename = station_name
    
    # รายการรูปแบบชื่อไฟล์ที่เป็นไปได้
    filename_patterns = [
        f'{station_filename}.csv',
        f'{station_name}.csv',
        f'{station_filename.replace("export-", "")}.csv',
        f'{station_name.replace("export-", "")}.csv',
        f'{station_filename.replace("export-", "")}-1h.csv',
        f'{station_name.replace("export-", "")}-1h.csv'
    ]
    
    # รายการโฟลเดอร์ที่จะค้นหา
    base_dir = os.path.dirname(os.path.abspath(__file__))
    search_dirs = [
        os.path.join(base_dir, 'static'),
        os.path.join(os.path.dirname(base_dir), 'static'),
        os.path.join(base_dir, 'static', 'data'),
        os.path.join(base_dir, 'data'),
        base_dir,
        os.path.dirname(base_dir)
    ]
    
    debug_log(f"โฟลเดอร์ที่จะค้นหา: {search_dirs}")
    
    # ค้นหาไฟล์ในทุกโฟลเดอร์และทุกรูปแบบชื่อ
    for search_dir in search_dirs:
        if not os.path.exists(search_dir):
            debug_log(f"โฟลเดอร์ไม่มีอยู่: {search_dir}")
            continue
            
        debug_log(f"กำลังค้นหาในโฟลเดอร์: {search_dir}")
        
        # ค้นหาตามรูปแบบชื่อไฟล์
        for pattern in filename_patterns:
            path = os.path.join(search_dir, pattern)
            debug_log(f"ตรวจสอบไฟล์: {path}")
            if os.path.exists(path):
                debug_log(f"พบไฟล์ CSV: {path}")
                return path
        
        # ค้นหาไฟล์ CSV ทั้งหมดในโฟลเดอร์
        all_csv_files = glob.glob(os.path.join(search_dir, "*.csv"))
        debug_log(f"ไฟล์ CSV ทั้งหมดในโฟลเดอร์: {all_csv_files}")
        
        # ตรวจสอบว่ามีไฟล์ใดที่มีชื่ออยู่ในชื่อไฟล์
        station_variants = [
            station_name,
            station_filename,
            station_name.replace("export-", ""),
            station_filename.replace("export-", "")
        ]
        
        for csv_file in all_csv_files:
            filename = os.path.basename(csv_file)
            for variant in station_variants:
                if variant.lower() in filename.lower():
                    debug_log(f"พบไฟล์ CSV ที่ตรงกับสถานี: {csv_file}")
                    return csv_file
    
    # ค้นหาในโฟลเดอร์ย่อยทั้งหมด
    for search_dir in search_dirs:
        if not os.path.exists(search_dir):
            continue
            
        debug_log(f"กำลังค้นหาในโฟลเดอร์ย่อยของ: {search_dir}")
        for root, dirs, files in os.walk(search_dir):
            csv_files = [f for f in files if f.endswith('.csv')]
            debug_log(f"ไฟล์ CSV ในโฟลเดอร์ {root}: {csv_files}")
            
            for csv_file in csv_files:
                for variant in station_variants:
                    if variant.lower() in csv_file.lower():
                        full_path = os.path.join(root, csv_file)
                        debug_log(f"พบไฟล์ CSV ในโฟลเดอร์ย่อย: {full_path}")
                        return full_path
    
    debug_log(f"ไม่พบไฟล์ CSV สำหรับสถานี: {station_name}")
    return None

# ฟังก์ชันสำหรับอ่านข้อมูลจากไฟล์ CSV
def read_csv_data(csv_path):
    """อ่านข้อมูลจากไฟล์ CSV และแปลงให้อยู่ในรูปแบบที่เหมาะสม"""
    debug_log(f"กำลังอ่านไฟล์ CSV: {csv_path}")
    
    try:
        # อ่านไฟล์ CSV
        df = pd.read_csv(csv_path)
        debug_log(f"อ่านไฟล์สำเร็จ, คอลัมน์: {df.columns.tolist()}")
        
        if df.empty:
            debug_log("ไฟล์ CSV ว่างเปล่า")
            return None
        
        # แปลงคอลัมน์เวลาให้เป็น datetime
        time_columns = ['timestamp', 'time', 'date', 'datetime']
        time_col = None
        
        for col in time_columns:
            if col in df.columns:
                time_col = col
                debug_log(f"พบคอลัมน์เวลา: {time_col}")
                break
        
        if time_col:
            try:
                # ใช้ format='mixed' เพื่อให้ pandas พยายามแปลงรูปแบบวันที่อัตโนมัติ
                df['timestamp'] = pd.to_datetime(df[time_col], format='mixed', errors='coerce')
                debug_log("แปลงคอลัมน์เวลาสำเร็จ")
            except Exception as e:
                debug_log(f"ไม่สามารถแปลงคอลัมน์เวลาได้: {e}")
                df['timestamp'] = pd.date_range(start=datetime.now() - timedelta(hours=24), periods=len(df), freq='h')
        else:
            debug_log("ไม่พบคอลัมน์เวลา, สร้างคอลัมน์เวลาใหม่")
            df['timestamp'] = pd.date_range(start=datetime.now() - timedelta(hours=24), periods=len(df), freq='h')
        
        # ตรวจสอบคอลัมน์ PM2.5
        pm25_columns = ['pm_2_5', 'pm25', 'PM2.5', 'PM25', 'pm2.5', 'PM_2_5', 'pm2_5']
        pm25_col = None
        
        for col in pm25_columns:
            if col in df.columns:
                pm25_col = col
                debug_log(f"พบคอลัมน์ PM2.5: {pm25_col}")
                break
        
        # ถ้าไม่พบคอลัมน์ PM2.5 ให้ลองดูทุกคอลัมน์ที่มีค่าเป็นตัวเลข
        if not pm25_col:
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]) and ('pm' in col.lower() or '2.5' in col.lower()):
                    pm25_col = col
                    debug_log(f"ใช้คอลัมน์ตัวเลขที่เกี่ยวข้องกับ PM: {pm25_col}")
                    break
        
        # ถ้ายังไม่พบ ให้ใช้คอลัมน์ตัวเลขคอลัมน์แรก
        if not pm25_col:
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    pm25_col = col
                    debug_log(f"ใช้คอลัมน์ตัวเลขคอลัมน์แรก: {pm25_col}")
                    break
        
        if not pm25_col:
            debug_log("ไม่พบคอลัมน์ PM2.5 ที่เหมาะสม")
            return None
        
        # แปลงค่า PM2.5 เป็นตัวเลข
        df[pm25_col] = pd.to_numeric(df[pm25_col], errors='coerce')
        df = df.dropna(subset=[pm25_col])
        
        # กรองข้อมูลเฉพาะ 24 ชั่วโมงที่ผ่านมา
        # ใช้ข้อมูลล่าสุด 24 จุด แทนการใช้ช่วงเวลา
        if len(df) > 24:
            debug_log(f"มีข้อมูลทั้งหมด {len(df)} รายการ, จะใช้เฉพาะ 24 รายการล่าสุด")
            df = df.sort_values('timestamp', ascending=False).head(24)
            df = df.sort_values('timestamp')  # เรียงกลับให้เป็นลำดับเวลา
        
        # สร้างข้อมูลสำหรับกราฟ
        result = {
            'timestamp': df['timestamp'].tolist(),
            'pm25': df[pm25_col].tolist(),
            'pm25_column': pm25_col
        }
        
        debug_log(f"อ่านข้อมูลสำเร็จ, จำนวนข้อมูล: {len(result['timestamp'])}")
        return result
        
    except Exception as e:
        debug_log(f"เกิดข้อผิดพลาดในการอ่านไฟล์ CSV: {e}")
        import traceback
        debug_log(traceback.format_exc())
        return None

# Callback เพื่อรับค่า station จาก URL parameter
@dash_app.callback(
    Output('selected-station', 'data'),
    Input('url', 'search')  # รับค่า query string จาก URL
)
def update_selected_station(search):
    if search:
        # แยกค่า station จาก query string (?station=...)
        params = parse_qs(search.lstrip('?'))
        station = params.get('station', [None])[0]
        debug_log(f"สถานีที่เลือกจาก URL: {station}")
        return station
    return None  # ถ้าไม่มีค่า station ใน URL

# Callback เพื่ออัปเดตกราฟ
@dash_app.callback(
    Output('feature-graph', 'figure'),
    [Input('interval-component', 'n_intervals'),
     Input('selected-station', 'data')]  # ใช้ 'data' จาก dcc.Store
)
def update_graph(n, selected_station):
    debug_log(f"กำลังอัปเดตกราฟสำหรับสถานี: {selected_station}")
    
    # ใช้สถานีที่เลือกจาก URL parameter หรือค่า default
    station = selected_station or 'export-jsps001'  # Default if none selected
    
    # ค้นหาไฟล์ CSV
    csv_path = find_csv_file(station)
    
    # ถ้าพบไฟล์ CSV ให้อ่านและประมวลผล
    if csv_path:
        data = read_csv_data(csv_path)
        
        if data and len(data['timestamp']) > 0:
            debug_log(f"สร้าฟกราฟจากข้อมูล CSV, จำนวนข้อมูล: {len(data['timestamp'])}")
            
            # สร้าฟกราฟ
            figure = {
                'data': [
                    go.Scatter(
                        x=data['timestamp'],
                        y=data['pm25'],
                        mode='lines+markers',
                        name='PM2.5 Data',
                        line={'color': '#4ECDC4'},
                        marker={'color': '#4ECDC4', 'size': 8}
                    )
                ],
                'layout': {
                    'title': {
                        'text': f'PM2.5 Data for {station.replace("export-", "")} (Last 24 Hours)',
                        'font': {'color': 'white'}
                    },
                    'xaxis': {
                        'title': 'Time',
                        'type': 'date',
                        'tickformat': '%H:%M',  # แสดงเฉพาะชั่วโมงและนาที
                        'color': 'white',
                        'gridcolor': '#444'
                    },
                    'yaxis': {
                        'title': 'PM2.5 (µg/m³)',
                        'color': 'white',
                        'gridcolor': '#444'
                    },
                    'paper_bgcolor': '#333',
                    'plot_bgcolor': '#333',
                    'hovermode': 'x unified',
                    'margin': {'l': 60, 'r': 30, 't': 50, 'b': 50}
                }
            }
            return figure
    
    # ถ้าไม่มีข้อมูล ให้สร้างข้อมูลจำลอง
    debug_log("ไม่พบข้อมูล, สร้างข้อมูลจำลอง")
    
    # สร้างข้อมูลจำลอง 24 ชั่วโมงย้อนหลัง
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=24)
    
    # สร้างเวลาทุก 1 ชั่วโมง
    timestamps = pd.date_range(start=start_time, end=end_time, freq='h')
    
    # สร้างค่า PM2.5 จำลอง (ค่าระหว่าง 10-50)
    import numpy as np
    base_value = np.random.randint(10, 30)
    pm25_values = [base_value + np.random.randint(-5, 15) for _ in range(len(timestamps))]
    
    # สร้าฟกราฟจากข้อมูลจำลอง
    figure = {
        'data': [
            go.Scatter(
                x=timestamps,
                y=pm25_values,
                mode='lines+markers',
                name='PM2.5 Data (Simulated)',
                line={'color': '#FF6B6B'},
                marker={'color': '#FF6B6B', 'size': 8}
            )
        ],
        'layout': {
            'title': {
                'text': f'Simulated PM2.5 Data for {station.replace("export-", "")} (Last 24 Hours)',
                'font': {'color': 'white'}
            },
            'xaxis': {
                'title': 'Time',
                'type': 'date',
                'tickformat': '%H:%M',  # แสดงเฉพาะชั่วโมงและนาที
                'color': 'white',
                'gridcolor': '#444'
            },
            'yaxis': {
                'title': 'PM2.5 (µg/m³)',
                'color': 'white',
                'gridcolor': '#444'
            },
            'paper_bgcolor': '#333',
            'plot_bgcolor': '#333',
            'hovermode': 'x unified',
            'margin': {'l': 60, 'r': 30, 't': 50, 'b': 50},
            'annotations': [{
                'text': 'Using simulated data',
                'showarrow': False,
                'font': {'color': 'white', 'size': 12},
                'xref': 'paper',
                'yref': 'paper',
                'x': 0.5,
                'y': 0.95
            }]
        }
    }
    return figure