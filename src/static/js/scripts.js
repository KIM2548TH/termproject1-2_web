document.addEventListener("DOMContentLoaded", function () {
    console.log("Script Loaded!");

    // Initialize the map with a dark theme
    const map = L.map('map', {
        center: [7.006, 100.498], // Center at Prince of Songkla University
        zoom: 13,
    });

    // Add Tile Layer (dark theme)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
    }).addTo(map);

    console.log("Map Loaded!");

    // Sample sensor data
    const sensorData = [
        {
            name: "Prince of Songkla University",
            latitude: 7.006,
            longitude: 100.498,
            pm25: 25,
            pm10: 40,
            temperature: 32,
            humidity: 65,
        },
        {
            name: "Hatyai City Municipal Park",
            latitude: 7.017,
            longitude: 100.504,
            pm25: 30,
            pm10: 45,
            temperature: 31,
            humidity: 70,
        },
        {
            name: "Jiranakorn Stadium",
            latitude: 7.008,
            longitude: 100.474,
            pm25: 28,
            pm10: 42,
            temperature: 30,
            humidity: 68,
        },
    ];

    // Add Marker and Popup for each sensor
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
            Temperature: ${sensor.temperature} °C<br>
            Humidity: ${sensor.humidity}%
        `);

        // Update sidebar information on marker click
        marker.on('click', function () {
            updateLocationInfo(
                sensor.name,
                sensor.pm25,
                sensor.pm10,
                sensor.temperature,
                sensor.humidity
            );
        });
    });

    // Function to update sidebar information
    function updateLocationInfo(location, pm25, pm10, temperature, humidity) {
        document.getElementById('location-name').textContent = location;
        document.getElementById('pm25-value').textContent = pm25;
        document.getElementById('pm10-value').textContent = pm10;
        document.getElementById('temperature-value').textContent = temperature;
        document.getElementById('humidity-value').textContent = humidity;
    }

    // Add Region Control with buttons next to zoom controls
    // Add Region Control with buttons arranged horizontally
    const regionControl = L.control({ position: 'topleft' });

    regionControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'region-control');
        div.style.display = 'flex';
        div.style.flexDirection = 'row'; // Arrange buttons in a row
        div.style.backgroundColor = '#333333'; // Dark background
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.2)';
        div.innerHTML = `
            <button id="north" class="region-button" style="margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">North</button>
            <button id="northeast" class="region-button" style="margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">Northeast</button>
            <button id="central" class="region-button" style="margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">Central</button>
            <button id="south" class="region-button" style="margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">South</button>
        `;
        return div;
    };

    // Add PM2.5 Air Quality Index Control to the map
    const airQualityControl = L.control({ position: 'bottomleft' });

    airQualityControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'air-quality-control');
        div.style.backgroundColor = "#333333"; // Dark background
        div.style.color = "#f5f5f5"; // Light text color
        div.style.padding = "8px";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
        div.innerHTML = `
            <h3 style="font-size: 14px; margin: 5px 0; text-align: center;">PM2.5 Air Quality Index</h3>
            <div class="index-level" style="background-color: #4CAF50; color: black; font-size: 12px; padding: 4px 8px; margin: 2px 0; border-radius: 4px;">Good (0-12 µg/m³)</div>
            <div class="index-level" style="background-color: #FFEB3B; color: black; font-size: 12px; padding: 4px 8px; margin: 2px 0; border-radius: 4px;">Moderate (12.1-35.4 µg/m³)</div>
            <div class="index-level" style="background-color: #FF9800; color: white; font-size: 12px; padding: 4px 8px; margin: 2px 0; border-radius: 4px;">Unhealthy for Sensitive Groups (35.5-55.4 µg/m³)</div>
            <div class="index-level" style="background-color: #F44336; color: white; font-size: 12px; padding: 4px 8px; margin: 2px 0; border-radius: 4px;">Unhealthy (55.5-150.4 µg/m³)</div>
            <div class="index-level" style="background-color: #9C27B0; color: white; font-size: 12px; padding: 4px 8px; margin: 2px 0; border-radius: 4px;">Very Unhealthy (150.5-250.4 µg/m³)</div>
            <div class="index-level" style="background-color: #795548; color: white; font-size: 12px; padding: 4px 8px; margin: 2px 0; border-radius: 4px;">Hazardous (250.5+ µg/m³)</div>
        `;
        return div;
    };

    // Add Combined Control to the map
    const combinedControl = L.control({ position: 'topleft' });

    combinedControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'combined-control');
        div.style.display = 'flex';
        div.style.flexDirection = 'column'; // Arrange vertically
        div.style.backgroundColor = '#333333'; // Dark background
        div.style.padding = '20px'; // Increase padding for larger size
        div.style.borderRadius = '12px'; // Increase border radius for larger size
        div.style.boxShadow = '0px 0px 15px rgba(0,0,0,0.3)'; // Larger shadow for emphasis
        div.style.width = '350px'; // Increase width for larger size
        div.innerHTML = `
            <input type="text" id="search-input" placeholder="Search for province or station..." style="width: 100%; padding: 8px; border: none; border-radius: 4px; background-color: #444444; color: #f5f5f5; margin-bottom: 10px;">
            <ul id="search-suggestions" style="list-style: none; padding: 0; margin: 0; background-color: #333333; color: #f5f5f5; border-radius: 4px; box-shadow: 0px 0px 10px rgba(0,0,0,0.2); display: none;"></ul>
            <div style="display: flex; justify-content: space-around;"> <!-- Adjusted for symmetry -->
                <button id="north" class="region-button" style="flex: 1; margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">North</button>
                <button id="northeast" class="region-button" style="flex: 1; margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">Northeast</button>
                <button id="central" class="region-button" style="flex: 1; margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">Central</button>
                <button id="south" class="region-button" style="flex: 1; margin: 5px; background-color: #444444; color: #ffffff; border: none; padding: 10px 20px; border-radius: 20px;">South</button>
            </div>
        `;
        return div;
    };

    combinedControl.addTo(map);

    // Add event listener for search input
    document.getElementById('search-input').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const suggestions = sensorData.filter(sensor => sensor.name.toLowerCase().includes(query));
        const suggestionsList = document.getElementById('search-suggestions');
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = suggestions.length ? 'block' : 'none';

        suggestions.forEach(sensor => {
            const li = document.createElement('li');
            li.textContent = sensor.name;
            li.style.padding = '8px';
            li.style.cursor = 'pointer';
            li.style.backgroundColor = '#444444'; // Match dropdown style
            li.style.borderBottom = '2px solid #555555'; // Larger border for emphasis
            li.addEventListener('click', function () {
                map.setView([sensor.latitude, sensor.longitude], 13);
                suggestionsList.style.display = 'none';
            });
            suggestionsList.appendChild(li);
        });
    });

    // Add PM2.5 Air Quality Index Control to the map
    airQualityControl.addTo(map);
    zoomControl.addTo(map);

    // Ensure zoom control buttons have a dark theme
    const zoomControl = L.control.zoom({ position: 'topleft' });
    zoomControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'leaflet-control-zoom');
        div.style.backgroundColor = '#333333'; // Dark background
        div.style.color = '#ffffff'; // Light text color
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.2)';
        return div;
    };

    zoomControl.addTo(map);

    // Define center and zoom for each region
    const regions = {
        north: { center: [18.796, 98.979], zoom: 8 },
        northeast: { center: [16.103, 102.832], zoom: 7 },
        central: { center: [14.064, 100.612], zoom: 8 },
        south: { center: [7.006, 100.498], zoom: 9 },
    };

    // Add event listeners for region buttons
    document.querySelectorAll('.region-button').forEach(button => {
        button.addEventListener('click', function () {
            const selectedRegion = this.id;
            const region = regions[selectedRegion];
            map.setView(region.center, region.zoom);
        });
    });
});