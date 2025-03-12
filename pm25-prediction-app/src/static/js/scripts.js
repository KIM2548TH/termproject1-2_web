document.addEventListener("DOMContentLoaded", function() {
    console.log("Script Loaded!"); // Debugging log

    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Error: #map ไม่พบใน DOM!");
        return;
    }

    console.log("Initializing Leaflet Map...");
    const map = L.map('map', {
        center: [13.736717, 100.523186], // Center ที่กรุงเทพ (เปลี่ยนได้)
        zoom: 10,
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
            const marker = L.marker([sensor.latitude, sensor.longitude]).addTo(map);
            marker.bindPopup(`Sensor: ${sensor.name}<br>PM2.5: ${sensor.pm25} µg/m³`);
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

    // Event listener for sensor selection
    const sensorSelect = document.getElementById('sensor-select');
    const pm25Display = document.getElementById('pm25-value');

    if (sensorSelect && pm25Display) {
        sensorSelect.addEventListener('change', function() {
            const selectedSensorId = this.value;
            fetch(`/api/predictions/${selectedSensorId}`)
                .then(response => response.json())
                .then(data => {
                    pm25Display.innerText = `Predicted PM2.5: ${data.pm25} µg/m³`;
                })
                .catch(error => console.error('Error fetching prediction data:', error));
        });
    } else {
        console.warn("Warning: #sensor-select หรือ #pm25-value ไม่พบใน DOM");
    }
});
