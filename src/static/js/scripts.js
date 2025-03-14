document.addEventListener("DOMContentLoaded", function () {
    console.log("Script Loaded!");

    // กำหนดค่าเริ่มต้นของแผนที่
    const map = L.map('map', {
        center: [7.006, 100.498], // ศูนย์กลางที่มหาวิทยาลัยสงขลานครินทร์
        zoom: 13,
    });

    // เพิ่ม Tile Layer (แผนที่พื้นหลัง)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
    }).addTo(map);

    console.log("Map Loaded!");

    // ข้อมูลเซ็นเซอร์ตัวอย่าง
    const sensorData = [
        {
            name: "มหาวิทยาลัยสงขลานครินทร์",
            latitude: 7.006,
            longitude: 100.498,
            pm25: 25,
            pm10: 40,
            temperature: 32,
            humidity: 65,
        },
        {
            name: "สวนสาธารณะหาดใหญ่",
            latitude: 7.017,
            longitude: 100.504,
            pm25: 30,
            pm10: 45,
            temperature: 31,
            humidity: 70,
        },
        {
            name: "สนามกลางหาดใหญ่",
            latitude: 7.008,
            longitude: 100.474,
            pm25: 28,
            pm10: 42,
            temperature: 30,
            humidity: 68,
        },
    ];

    // เพิ่ม Marker และ Popup สำหรับแต่ละเซ็นเซอร์
    sensorData.forEach(sensor => {
        const marker = L.marker([sensor.latitude, sensor.longitude], {
            icon: L.icon({
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            }),
        }).addTo(map);

        marker.bindPopup(`
            <b>${sensor.name}</b><br>
            PM2.5: ${sensor.pm25} µg/m³<br>
            PM10: ${sensor.pm10} µg/m³<br>
            อุณหภูมิ: ${sensor.temperature} °C<br>
            ความชื้น: ${sensor.humidity}%
        `);

        // เมื่อคลิกที่ Marker ให้อัปเดตข้อมูลใน sidebar
        marker.on('click', function () {
            updateLocationInfo(
                sensor.name, // ชื่อสถานที่
                sensor.pm25, // ค่า PM2.5
                sensor.pm10, // ค่า PM10
                sensor.temperature, // อุณหภูมิ
                sensor.humidity // ความชื้น
            );
        });
    });

    // ฟังก์ชันอัปเดตข้อมูลใน sidebar
    function updateLocationInfo(location, pm25, pm10, temperature, humidity) {
        // อัปเดตชื่อสถานที่
        document.getElementById('location-name').textContent = location;

        // อัปเดตค่า PM2.5
        document.getElementById('pm25-value').textContent = pm25;

        // อัปเดตค่า PM10
        document.getElementById('pm10-value').textContent = pm10;

        // อัปเดตอุณหภูมิ
        document.getElementById('temperature-value').textContent = temperature;

        // อัปเดตความชื้น
        document.getElementById('humidity-value').textContent = humidity;
    }
});