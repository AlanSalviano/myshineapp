// public/quick-routes.js

document.addEventListener('DOMContentLoaded', () => {
    const techTableBody = document.getElementById('tech-table-body');
    const clientTableBody = document.getElementById('client-table-body');
    const zipCodeInput = document.getElementById('zip-code-input');
    const verifyZipBtn = document.getElementById('verify-zip-btn');
    const zipCodeResults = document.getElementById('zip-code-results');
    const addTechRowBtn = document.getElementById('add-tech-row-btn');
    const saveTechDataBtn = document.getElementById('save-tech-data-btn');
    const techSelect = document.getElementById('tech-select');
    const addClientRowBtn = document.getElementById('add-client-row-btn');
    const optimizeItineraryBtn = document.getElementById('optimize-itinerary-btn');
    const itineraryList = document.getElementById('itinerary-list');
    const mapContainer = document.getElementById('map');
    
    // Replace with your actual Google Maps API Key
    const GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE";

    let techData = [];
    let clientData = [];
    let map;
    let directionsService;
    let directionsRenderer;
    
    // Helper functions
    function saveTechData() {
        localStorage.setItem('tech_data', JSON.stringify(techData));
    }

    function loadTechData() {
        const savedData = localStorage.getItem('tech_data');
        return savedData ? JSON.parse(savedData) : null;
    }
    
    async function getLatLon(zipCode) {
        if (!zipCode) return [null, null, null];
        try {
            const response = await fetch(`http://api.zippopotam.us/us/${zipCode}`);
            if (!response.ok) return [null, null, null];
            const data = await response.json();
            const place = data.places[0];
            return [parseFloat(place.latitude), parseFloat(place.longitude), place['place name'], place['state abbreviation']];
        } catch (error) {
            console.error('Error fetching zip code data:', error);
            return [null, null, null, null];
        }
    }

    async function getDrivingDirections(origin, destination) {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            if (data.status === 'OK') {
                const leg = data.routes[0].legs[0];
                return {
                    distance: leg.distance.text,
                    duration: leg.duration.text,
                    polyline: data.routes[0].overview_polyline.points,
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching directions:', error);
            return null;
        }
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
        return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
    }

    // UI Rendering Functions
    function renderTechTable() {
        techTableBody.innerHTML = '';
        techData.forEach((tech, i) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-border hover:bg-muted/50 transition-colors';
            row.innerHTML = `
                <td class="p-4"><input type="text" class="w-full bg-transparent border-none focus:outline-none" value="${tech.nome}" data-key="nome" data-index="${i}"></td>
                <td class="p-4"><select class="w-full bg-transparent border-none focus:outline-none" data-key="categoria" data-index="${i}"><option value="">Selecione</option><option value="Franquia">Franquia</option><option value="Central">Central</option></select></td>
                <td class="p-4"><input type="text" class="w-full bg-transparent border-none focus:outline-none" value="${tech.tipo_atendimento}" data-key="tipo_atendimento" data-index="${i}"></td>
                <td class="p-4"><input type="text" class="w-full bg-transparent border-none focus:outline-none" value="${tech.zip_code}" data-key="zip_code" data-index="${i}" maxlength="5"></td>
                <td class="p-4">
                    <div class="flex flex-wrap gap-1">
                        ${tech.cidades.map(city => `<span class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">${city}</span>`).join('')}
                    </div>
                    <input type="text" class="mt-2 w-full bg-transparent border-none focus:outline-none" placeholder="Adicionar cidade e Enter" data-key="new_city" data-index="${i}">
                </td>
                <td class="p-4"><button data-index="${i}" class="text-red-600 hover:text-red-800">🗑️</button></td>
            `;
            techTableBody.appendChild(row);
            row.querySelector(`select[data-key="categoria"]`).value = tech.categoria;
        });

        techTableBody.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                const key = e.target.dataset.key;
                if (key === 'new_city') {
                    const newCity = e.target.value.trim();
                    if (newCity && !techData[index].cidades.includes(newCity)) {
                        techData[index].cidades.push(newCity);
                        saveTechData();
                        renderTechTable();
                    }
                    e.target.value = '';
                } else {
                    techData[index][key] = e.target.value;
                }
            });
        });
        
        techTableBody.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                techData.splice(index, 1);
                saveTechData();
                renderTechTable();
                populateTechSelect();
            });
        });
    }
    
    function renderClientTable() {
        clientTableBody.innerHTML = '';
        clientData.forEach((client, i) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-border hover:bg-muted/50 transition-colors';
            row.innerHTML = `
                <td class="p-4"><input type="text" class="w-full bg-transparent border-none focus:outline-none" value="${client.nome}" data-key="nome" data-index="${i}"></td>
                <td class="p-4"><input type="text" class="w-full bg-transparent border-none focus:outline-none" value="${client.zip_code}" data-key="zip_code" data-index="${i}" maxlength="5"></td>
                <td class="p-4"><button data-index="${i}" class="text-red-600 hover:text-red-800">🗑️</button></td>
            `;
            clientTableBody.appendChild(row);
        });

        clientTableBody.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                const key = e.target.dataset.key;
                clientData[index][key] = e.target.value;
            });
        });

        clientTableBody.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                clientData.splice(index, 1);
                renderClientTable();
            });
        });
    }

    function populateTechSelect() {
        techSelect.innerHTML = techData.length > 0 ? '' : '<option value="">Nenhum técnico cadastrado</option>';
        techData.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.nome;
            option.textContent = tech.nome;
            techSelect.appendChild(option);
        });
    }
    
    // Main logic
    async function handleVerifyZipCode() {
        const zipCode = zipCodeInput.value.trim();
        zipCodeResults.innerHTML = '';
        if (!zipCode) {
            zipCodeResults.innerHTML = `<p class="text-red-600">Por favor, insira um Zip Code.</p>`;
            return;
        }

        const [lat, lon, city, state] = await getLatLon(zipCode);
        if (!city) {
            zipCodeResults.innerHTML = `<p class="text-red-600">Zip Code não encontrado.</p>`;
            return;
        }

        zipCodeResults.innerHTML = `
            <p class="text-green-600 font-bold">Zip Code Encontrado!</p>
            <p><strong>Cidade:</strong> ${city}, ${state}</p>
        `;

        const availableTechs = techData.filter(tech => tech.cidades.includes(city));
        const techNames = availableTechs.map(tech => tech.nome).join(', ');
        zipCodeResults.innerHTML += `<p><strong>Técnicos disponíveis:</strong> ${techNames || 'Nenhum'}</p>`;

        if (availableTechs.length > 0) {
            let closestTech = null;
            let minDistance = Infinity;

            for (const tech of availableTechs) {
                const [techLat, techLon] = await getLatLon(tech.zip_code);
                if (techLat !== null) {
                    const distance = calculateDistance(lat, lon, techLat, techLon);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestTech = tech;
                    }
                }
            }
            if (closestTech) {
                zipCodeResults.innerHTML += `
                    <p><strong>Técnico mais próximo:</strong> ${closestTech.nome}</p>
                    <p><strong>Restrições:</strong> ${closestTech.tipo_atendimento || 'Não especificado'}</p>
                `;
            }
        }
    }
    
    async function handleOptimizeItinerary() {
        const selectedTechName = techSelect.value;
        if (!selectedTechName) {
            itineraryList.innerHTML = `<p class="text-red-600">Selecione um técnico para otimizar o itinerário.</p>`;
            return;
        }

        const selectedTech = techData.find(tech => tech.nome === selectedTechName);
        if (!selectedTech || !selectedTech.zip_code) {
            itineraryList.innerHTML = `<p class="text-red-600">Dados do técnico ou Zip Code de origem inválidos.</p>`;
            return;
        }

        const validClients = await Promise.all(clientData.map(async client => {
            const [lat, lon, city] = await getLatLon(client.zip_code);
            return lat !== null ? { ...client, lat, lon, city } : null;
        }));
        const clientsWithCoords = validClients.filter(c => c !== null);

        if (clientsWithCoords.length === 0) {
            itineraryList.innerHTML = `<p class="text-red-600">Nenhum cliente com Zip Code válido foi encontrado.</p>`;
            return;
        }

        let currentOrigin = selectedTech.zip_code;
        let currentLat = (await getLatLon(currentOrigin))[0];
        let currentLon = (await getLatLon(currentOrigin))[1];
        let unvisitedClients = [...clientsWithCoords];
        const optimizedItinerary = [];
        
        while (unvisitedClients.length > 0) {
            let closestClient = null;
            let minDistance = Infinity;
            
            for (const client of unvisitedClients) {
                const distance = calculateDistance(currentLat, currentLon, client.lat, client.lon);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestClient = client;
                }
            }
            optimizedItinerary.push(closestClient);
            currentLat = closestClient.lat;
            currentLon = closestClient.lon;
            unvisitedClients = unvisitedClients.filter(c => c !== closestClient);
        }

        // Display results and map
        itineraryList.innerHTML = '';
        const waypoints = optimizedItinerary.map(c => ({
            location: c.zip_code,
            stopover: true
        }));

        const request = {
            origin: selectedTech.zip_code,
            destination: optimizedItinerary[optimizedItinerary.length - 1].zip_code,
            waypoints: waypoints.slice(0, -1),
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                
                let totalDistance = 0;
                let totalDuration = 0;
                
                const route = response.routes[0];
                itineraryList.innerHTML = 'A melhor sequência de atendimento é:';

                const optimizedOrder = response.routes[0].waypoint_order;
                const sortedClients = optimizedOrder.map(index => optimizedItinerary[index]);
                
                let currentPoint = selectedTech.zip_code;
                
                sortedClients.forEach((client, i) => {
                    const leg = route.legs[i];
                    totalDistance += leg.distance.value;
                    totalDuration += leg.duration.value;
                    
                    itineraryList.innerHTML += `
                        <p><strong>${i + 1}. ${client.nome}</strong> (Zip Code: ${client.zip_code})</p>
                        <p class="ml-4 text-sm">Tempo: ${leg.duration.text} | Distância: ${leg.distance.text}</p>
                    `;
                });
                
                itineraryList.innerHTML += `<div class="mt-4 font-bold">Total: ${Math.round(totalDuration / 60)} min / ${(totalDistance / 1000).toFixed(2)} km</div>`;
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    // Initialize
    async function init() {
        const savedData = loadTechData();
        if (savedData) {
            techData = savedData;
        } else {
            try {
                const response = await fetch('/api/get-tech-data');
                if (response.ok) {
                    const apiData = await response.json();
                    techData = apiData;
                    saveTechData(); // Save the fetched data for future sessions
                } else {
                    console.error('Failed to fetch initial tech data from API.');
                }
            } catch (error) {
                console.error('Error fetching initial tech data:', error);
            }
        }
        clientData = [{ nome: "", zip_code: "" }];
        renderTechTable();
        renderClientTable();
        populateTechSelect();
    }

    window.initMap = function() {
        map = new google.maps.Map(mapContainer, {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 4,
        });
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
    }

    // Event Listeners
    verifyZipBtn.addEventListener('click', handleVerifyZipCode);
    addTechRowBtn.addEventListener('click', () => {
        techData.push({ nome: "", categoria: "", tipo_atendimento: "", zip_code: "", cidades: [] });
        renderTechTable();
        populateTechSelect();
    });
    saveTechDataBtn.addEventListener('click', () => {
        saveTechData();
        alert('Dados salvos!');
    });
    addClientRowBtn.addEventListener('click', () => {
        clientData.push({ nome: "", zip_code: "" });
        renderClientTable();
    });
    optimizeItineraryBtn.addEventListener('click', handleOptimizeItinerary);

    init();
});
