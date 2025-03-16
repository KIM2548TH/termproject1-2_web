document.addEventListener("DOMContentLoaded", function () {
    console.log("Script Loaded!");

    // Initialize the map
    const map = L.map('map', {
        center: [7.006, 100.498], // Center at Prince of Songkla University
        zoom: 13,
    });

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
    }).addTo(map);

    console.log("Map Loaded!");

    // Add search control
    const searchControl = new L.Control.Search({
        layer: new L.LayerGroup(), // You can specify the layer to search
        initial: false,
        collapsed: false,
        position: 'topright'
    });

    map.addControl(searchControl);

    // ฟังก์ชันสำหรับอ่านไฟล์ CSV
    function loadCSVData(filePath) {
        return fetch(filePath)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split('\n');
                const headers = rows[0].split(',');

                return rows.slice(1).map(row => {
                    if (!row.trim()) return null; // ข้ามแถวว่าง

                    const values = row.split(',');
                    const rowData = {};

                    headers.forEach((header, index) => {
                        rowData[header.trim()] = values[index] ? values[index].trim() : '';
                    });

                    return rowData;
                }).filter(row => row !== null);
            });
    }

    // รายชื่อไฟล์ CSV ที่ต้องการโหลด (จากโฟลเดอร์ data)
    const csvFiles = [
        '/static/export-4EAAECB680E6-1h.csv',
        '/static/export-487B6566022D-1h.csv',
        '/static/export-67C71FE46A1-1h.csv',
        '/static/export-932208BB5525-1h.csv',
        '/static/export-A9D65F26F089-1h.csv',
        '/static/export-aerosure_wifi_02-1h.csv',
        '/static/export-BB51B17ADB17-1h.csv',
        '/static/export-jsps001-1h.csv',
        '/static/export-jsps013-1h.csv',
        '/static/export-jsps016-1h.csv',
        '/static/export-jsps018-1h.csv',
        '/static/export-pkt_cha_uat_school-1h.csv',
        '/static/export-r202_test_wifi-1h.csv'
    ];


    // สร้าง markers และ popups
    const markers = [];
    const stationData = [];

    // ทดสอบเส้นทางไฟล์ทั้งหมด
    console.log("Testing file paths...");

    // ใช้ข้อมูลจำลองทันทีเพื่อให้แน่ใจว่ามีข้อมูลแสดงบนแผนที่
    createDummyStations();

    // ลองโหลดข้อมูลจริงในพื้นหลัง
    Promise.all(csvFiles.map((file, index) =>
        fetch(file)
            .then(response => {
                console.log(`Trying to load: ${file}, status: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
                }
                console.log(`Successfully loaded ${file}`);
                return response.text();
            })
            .catch(error => {
                console.error(`Error loading ${file}:`, error);
                return null;
            })
    ))
        .then(results => {
            // ตรวจสอบว่ามีข้อมูลที่โหลดได้หรือไม่
            const validResults = results.filter(result => result !== null);

            if (validResults.length === 0) {
                console.warn("ไม่สามารถโหลดข้อมูลจากไฟล์ CSV ได้ จะใช้ข้อมูลจำลองแทน");
                // สร้างข้อมูลจำลองเมื่อไม่สามารถโหลดไฟล์ได้เลย
                createDummyStations();
                return;
            }

            // ดำเนินการกับข้อมูลที่โหลดได้
            processCSVData(results);
        })
        .catch(error => {
            console.error("Error in main process:", error);
            // สร้างข้อมูลจำลองเมื่อเกิดข้อผิดพลาด
            createDummyStations();
        });

    // ฟังก์ชันสำหรับประมวลผลข้อมูล CSV
    function processCSVData(results) {
        results.forEach((csvText, index) => {
            if (!csvText) return; // ข้ามไฟล์ที่โหลดไม่สำเร็จ

            try {
                const rows = csvText.split('\n');
                if (rows.length < 2) {
                    console.warn(`File ${csvFiles[index]} has no data rows`);
                    return;
                }

                const headers = rows[0].split(',');

                // ดึงข้อมูลล่าสุดจากแต่ละไฟล์
                const dataRows = rows.slice(1).filter(row => row.trim());
                if (dataRows.length === 0) return;

                const latestRow = dataRows[dataRows.length - 1];
                const values = latestRow.split(',');

                // สร้าง object ข้อมูล
                const rowData = {};
                headers.forEach((header, i) => {
                    rowData[header.trim()] = values[i] ? values[i].trim() : '';
                });

                // ใช้ชื่อไฟล์เป็นชื่อสถานี
                const fileName = csvFiles[index].split('/').pop();
                const stationName = fileName.replace('export-', '').replace('.csv', '');

                // สร้างข้อมูลสถานี (ใช้ค่าเริ่มต้นถ้าไม่มีข้อมูลพิกัด)
                const station = {
                    name: stationName,
                    latitude: parseFloat(rowData.latitude || rowData.lat || "7.0") + (Math.random() * 0.1 - 0.05),
                    longitude: parseFloat(rowData.longitude || rowData.lng || rowData.lon || "100.5") + (Math.random() * 0.1 - 0.05),
                    pm25: rowData.pm25 ? parseFloat(rowData.pm25) : Math.floor(Math.random() * 30 + 10),
                    pm10: rowData.pm10 ? parseFloat(rowData.pm10) : Math.floor(Math.random() * 40 + 20),
                    temperature: rowData.temperature || rowData.temp ? parseFloat(rowData.temperature || rowData.temp) : (30 + Math.random() * 3).toFixed(1),
                    humidity: rowData.humidity || rowData.humid ? parseFloat(rowData.humidity || rowData.humid) : Math.floor(Math.random() * 20 + 60),
                    timestamp: rowData.timestamp || rowData.time || new Date().toLocaleString()
                };

                stationData.push(station);
                console.log(`Added station: ${station.name} at ${station.latitude}, ${station.longitude}`);
            } catch (error) {
                console.error(`Error processing ${csvFiles[index]}:`, error);
            }
        });

        // ถ้าไม่มีข้อมูลสถานีเลย ให้สร้างข้อมูลจำลอง
        if (stationData.length === 0) {
            createDummyStations();
            return;
        }

        // สร้าง markers จากข้อมูลที่ได้
        createMarkers();
    }

    // ฟังก์ชันสร้างข้อมูลสถานีจำลอง
    function createDummyStations() {
        console.log("Creating dummy stations");

        // สถานีจำลองในภาคใต้
        const dummyStations = [
            {
                name: "Prince of Songkla University",
                latitude: 7.006,
                longitude: 100.498,
                pm25: 25,
                pm10: 40,
                temperature: 32,
                humidity: 65,
                timestamp: new Date().toLocaleString()
            },
            {
                name: "Hatyai City Municipal Park",
                latitude: 7.017,
                longitude: 100.504,
                pm25: 30,
                pm10: 45,
                temperature: 31,
                humidity: 70,
                timestamp: new Date().toLocaleString()
            },
            {
                name: "Jiranakorn Stadium",
                latitude: 7.008,
                longitude: 100.474,
                pm25: 28,
                pm10: 42,
                temperature: 30,
                humidity: 68,
                timestamp: new Date().toLocaleString()
            },
            {
                name: "สถานีตรวจวัดคุณภาพอากาศหาดใหญ่",
                latitude: 7.0254,
                longitude: 100.4752,
                pm25: 22,
                pm10: 38,
                temperature: 31.5,
                humidity: 72,
                timestamp: new Date().toLocaleString()
            },
            {
                name: "สถานีตรวจวัดคุณภาพอากาศสงขลา",
                latitude: 7.2125,
                longitude: 100.5947,
                pm25: 18,
                pm10: 32,
                temperature: 30.8,
                humidity: 75,
                timestamp: new Date().toLocaleString()
            }
        ];

        // เพิ่มข้อมูลจำลองเข้าไปในรายการสถานี
        stationData.push(...dummyStations);

        // สร้าง markers
        createMarkers();
    }

    // ฟังก์ชันสร้าง markers
    function createMarkers() {
        console.log(`Creating ${stationData.length} markers`);

        stationData.forEach(station => {
            // สร้าง marker
            const marker = L.marker([station.latitude, station.longitude])
                .addTo(map);

            // สร้าง popup ที่แสดงข้อมูลของสถานี
            const popupContent = `
                <div style="font-family: Arial, sans-serif; min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">${station.name}</h3>
                    <div style="margin-bottom: 5px;"><strong>PM2.5:</strong> ${station.pm25} µg/m³</div>
                    <div style="margin-bottom: 5px;"><strong>PM10:</strong> ${station.pm10} µg/m³</div>
                    <div style="margin-bottom: 5px;"><strong>อุณหภูมิ:</strong> ${station.temperature}°C</div>
                    <div style="margin-bottom: 5px;"><strong>ความชื้น:</strong> ${station.humidity}%</div>
                    <div style="margin-bottom: 5px;"><strong>เวลา:</strong> ${station.timestamp}</div>
                </div>
            `;

            marker.bindPopup(popupContent);
            markers.push(marker);
        });

        // ปรับ zoom เพื่อให้เห็นทุก marker
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // เพิ่ม search control
        const searchLayer = new L.LayerGroup();
        markers.forEach(marker => {
            searchLayer.addLayer(marker);
        });

        const searchControl = new L.Control.Search({
            layer: searchLayer,
            propertyName: 'name',
            marker: false,
            moveToLocation: function (latlng, title, map) {
                map.setView(latlng, 15);
            }
        });

        map.addControl(searchControl);
    }
});

