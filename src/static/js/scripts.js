document.addEventListener("DOMContentLoaded", function() {
    console.log("Script Loaded!"); // Debugging log

    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Error: #map ไม่พบใน DOM!");
        return;
    }

    console.log("Initializing Leaflet Map...");
    const map = L.map('map', {
        center: [7.006, 100.498], // Center ที่มหาวิทยาลัยสงขลานครินทร์
        zoom: 13,
        dragging: true,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        tap: true,
    });

    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        detectRetina: true,
    }).addTo(map);

    console.log("Map Loaded!");

    // Function to update PM2.5 values on the map
    function updatePM25Values(sensorData) {
        console.log("Updating PM2.5 values...");

        // Remove any existing markers before adding new ones
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        sensorData.forEach(sensor => {
            const marker = L.marker([sensor.latitude, sensor.longitude], {
                icon: L.icon({
                    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                })
            }).addTo(map);
            marker.bindPopup(`Sensor: ${sensor.name}<br>PM2.5: ${sensor.pm25} µg/m³`);
            marker.on('click', function() {
                updateLocationInfo(sensor.name, sensor.pm25);
            });
        });
    }

    // Fetch sensor data and update the map
    async function fetchSensorData() {
        try {
            console.log("Fetching sensor data...");
            const response = await fetch('/api/sensors');
            const data = await response.json();
            console.log('Sensor Data:', data);
            updatePM25Values(data);
        } catch (error) {
            console.error('Error fetching sensor data:', error);
        }
    }

    // Call the function to fetch sensor data
    fetchSensorData();

    // Add a marker for the sensor at มหาวิทยาลัยสงขลานครินทร์
    const psuMarker = L.marker([7.006, 100.498], {
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        })
    }).addTo(map);
    psuMarker.bindPopup('มหาวิทยาลัยสงขลานครินทร์<br>PM2.5: 25 µg/m³');
    psuMarker.on('click', function() {
        updateLocationInfo('มหาวิทยาลัยสงขลานครินทร์', 25);
    });

    // Add a marker for the sensor at สวนสาธารณะหาดใหญ่
    const hatyaiParkMarker = L.marker([7.017, 100.504], {
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        })
    }).addTo(map);
    hatyaiParkMarker.bindPopup('สวนสาธารณะหาดใหญ่<br>PM2.5: 30 µg/m³');
    hatyaiParkMarker.on('click', function() {
        updateLocationInfo('สวนสาธารณะหาดใหญ่', 30);
    });

    // Add a marker for the sensor at สนามกลางหาดใหญ่
    const hatyaiStadiumMarker = L.marker([7.008, 100.474], {
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        })
    }).addTo(map);
    hatyaiStadiumMarker.bindPopup('สนามกลางหาดใหญ่<br>PM2.5: 28 µg/m³');
    hatyaiStadiumMarker.on('click', function() {
        updateLocationInfo('สนามกลางหาดใหญ่', 28);
    });

    // Function to update location and temperature in the sidebar
    function updateLocationInfo(location, pm25) {
        document.getElementById('location-name').textContent = location;
        document.getElementById('temperature').textContent = `${pm25} µg/m³`;
    }
});