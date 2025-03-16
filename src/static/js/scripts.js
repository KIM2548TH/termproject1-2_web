document.addEventListener("DOMContentLoaded", function () {
    console.log("Script Loaded!");

    // Initialize the map
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

    // Add Markers
    sensorData.forEach(sensor => {
        const marker = L.marker([sensor.latitude, sensor.longitude]).addTo(map);
        marker.bindPopup(`
            <b>${sensor.name}</b><br>
            PM2.5: ${sensor.pm25} µg/m³<br>
            PM10: ${sensor.pm10} µg/m³<br>
            Temperature: ${sensor.temperature} °C<br>
            Humidity: ${sensor.humidity}%
        `);
    });

    // Define center and zoom for each region
    const regions = {
        north: { center: [18.796, 98.979], zoom: 8 },
        northeast: { center: [16.103, 102.832], zoom: 7 },
        central: { center: [14.064, 100.612], zoom: 8 },
        south: { center: [7.006, 100.498], zoom: 9 },
    };

    // 📌 Move Search Province to Top-Right
    const searchControl = L.control({ position: 'topright' });

    searchControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'search-control');
        div.innerHTML = `
            <input type="text" id="search-input" placeholder="Search for province or station..."
            style="width: 250px; padding: 8px; border-radius: 5px; background-color: white; border: 1px solid #ccc;">
            <ul id="search-suggestions" style="display: none; background: white; padding: 5px; list-style: none; margin: 0;"></ul>
        `;
        return div;
    };

    searchControl.addTo(map);

    document.getElementById('search-input').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const suggestions = sensorData.filter(sensor => sensor.name.toLowerCase().includes(query));
        const suggestionsList = document.getElementById('search-suggestions');
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = suggestions.length ? 'block' : 'none';

        suggestions.forEach(sensor => {
            const li = document.createElement('li');
            li.textContent = sensor.name;
            li.style.cursor = 'pointer';
            li.addEventListener('click', function () {
                map.setView([sensor.latitude, sensor.longitude], 13);
                suggestionsList.style.display = 'none';
            });
            suggestionsList.appendChild(li);
        });
    });

    // 📌 Move PM2.5 Quality Index to Bottom-Right
    const airQualityControl = L.control({ position: 'bottomright' });

    airQualityControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'air-quality-control');
        div.style.backgroundColor = "#333";
        div.style.color = "#fff";
        div.style.padding = "10px";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0px 0px 10px rgba(187, 220, 232, 0.92)";
        div.innerHTML = `
            <h3>PM2.5 Quality Index</h3>
            <div style="background:#4CAF50; padding:5px; margin:2px;">Good (0-12 µg/m³)</div>
            <div style="background:#FFEB3B; padding:5px; margin:2px;">Moderate (12.1-35.4 µg/m³)</div>
            <div style="background:#FF9800; padding:5px; margin:2px;">Unhealthy for Sensitive Groups (35.5-55.4 µg/m³)</div>
            <div style="background:#F44336; padding:5px; margin:2px;">Unhealthy (55.5-150.4 µg/m³)</div>
        `;
        return div;
    };

    airQualityControl.addTo(map);

    // 📌 Region Selection Buttons (Search Region)
    const regionControl = L.control({ position: 'topleft' });

    regionControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'region-control');
        div.style.backgroundColor = "#444";
        div.style.padding = "10px";
        div.style.borderRadius = "8px";
        div.innerHTML = `
            <button class="region-button" id="north">North</button>
            <button class="region-button" id="northeast">Northeast</button>
            <button class="region-button" id="central">Central</button>
            <button class="region-button" id="south">South</button>
        `;
        return div;
    };

    regionControl.addTo(map);

    // 📌 Fix Region Selection
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("region-button")) {
            const selectedRegion = event.target.id;
            const region = regions[selectedRegion];

            if (region) {
                map.setView(region.center, region.zoom);
                console.log(`Moving to ${selectedRegion}:`, region);
            }
        }
    });

    // // 📌 Fix Zoom Control
    // const zoomControl = L.control.zoom({ position: 'topleft' });
    // zoomControl.addTo(map);
});

