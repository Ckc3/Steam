
// Page navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Game Data API
async function fetchGameData() {
    const resultContainer = document.getElementById('game-data-result');
    resultContainer.innerHTML = '<div class="loading">Loading game data...</div>';
    
    try {
        const response = await fetch('https://fares.top/game_data.json');
        if (!response.ok) throw new Error('Failed to fetch game data');
        
        const data = await response.json();
        displayGameData(data, resultContainer);
    } catch (error) {
        resultContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function displayGameData(data, container) {
    let html = '<div class="success">Game data loaded successfully!</div>';
    
    if (Array.isArray(data)) {
        html += '<h3>Games:</h3>';
        data.slice(0, 20).forEach(game => {
            html += `
                <div class="game-item">
                    <h4>${game.name || 'Unnamed Game'}</h4>
                    <p>ID: ${game.id || 'N/A'}</p>
                    ${game.description ? `<p>${game.description}</p>` : ''}
                </div>
            `;
        });
        if (data.length > 20) {
            html += `<p>Showing first 20 of ${data.length} games</p>`;
        }
    } else if (typeof data === 'object') {
        html += '<h3>Game Data:</h3>';
        html += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
        html += `<p>${data}</p>`;
    }
    
    container.innerHTML = html;
}

// Download Game by Steam ID
function downloadGame() {
    const steamId = document.getElementById('steam-id-download').value.trim();
    const resultContainer = document.getElementById('download-result');
    
    if (!steamId) {
        resultContainer.innerHTML = '<div class="error">Please enter a Steam ID</div>';
        return;
    }
    
    const downloadUrl = `https://steamdatabase.s3.eu-north-1.amazonaws.com/${steamId}.zip`;
    
    resultContainer.innerHTML = `
        <div class="success">
            <p>Download link generated for Steam ID: ${steamId}</p>
            <a href="${downloadUrl}" class="download-link" download target="_blank">
                Download ${steamId}.zip
            </a>
            <p><small>Note: File availability depends on the Steam Database. If the download fails, the game files may not be available.</small></p>
        </div>
    `;
}

// Steam Apps List
async function fetchSteamApps() {
    const resultContainer = document.getElementById('apps-result');
    const searchTerm = document.getElementById('search-apps').value.toLowerCase();
    
    resultContainer.innerHTML = '<div class="loading">Loading Steam applications...</div>';
    
    try {
        const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v0002/');
        if (!response.ok) throw new Error('Failed to fetch Steam apps');
        
        const data = await response.json();
        displaySteamApps(data.applist.apps, searchTerm, resultContainer);
    } catch (error) {
        // Fallback for CORS issues
        resultContainer.innerHTML = `
            <div class="error">
                Direct API access blocked by CORS. Here's the API endpoint you can use:
                <br><br>
                <strong>API URL:</strong> https://api.steampowered.com/ISteamApps/GetAppList/v0002/
                <br><br>
                You can access this API through a CORS proxy or server-side implementation.
            </div>
        `;
    }
}

function displaySteamApps(apps, searchTerm, container) {
    let filteredApps = apps;
    
    if (searchTerm) {
        filteredApps = apps.filter(app => 
            app.name.toLowerCase().includes(searchTerm)
        );
    }
    
    let html = `<div class="success">Found ${filteredApps.length} applications</div>`;
    html += '<h3>Steam Applications:</h3>';
    
    filteredApps.slice(0, 50).forEach(app => {
        html += `
            <div class="game-item">
                <h4>${app.name}</h4>
                <p>App ID: ${app.appid}</p>
                <button onclick="fetchStoreInfoById('${app.appid}')" class="btn secondary">Get Store Info</button>
            </div>
        `;
    });
    
    if (filteredApps.length > 50) {
        html += `<p>Showing first 50 results. Use search to narrow down.</p>`;
    }
    
    container.innerHTML = html;
}

// Steam Store Info
async function fetchStoreInfo() {
    const steamId = document.getElementById('steam-id-store').value.trim();
    if (!steamId) {
        document.getElementById('store-result').innerHTML = '<div class="error">Please enter a Steam ID</div>';
        return;
    }
    
    await fetchStoreInfoById(steamId);
}

async function fetchStoreInfoById(steamId) {
    const resultContainer = document.getElementById('store-result');
    resultContainer.innerHTML = '<div class="loading">Loading store information...</div>';
    
    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}`);
        if (!response.ok) throw new Error('Failed to fetch store info');
        
        const data = await response.json();
        displayStoreInfo(data, steamId, resultContainer);
    } catch (error) {
        // Fallback for CORS issues
        resultContainer.innerHTML = `
            <div class="error">
                Direct API access blocked by CORS. Here's the API endpoint you can use:
                <br><br>
                <strong>API URL:</strong> https://store.steampowered.com/api/appdetails?appids=${steamId}
                <br><br>
                You can access this API through a CORS proxy or server-side implementation.
                <br><br>
                <a href="https://store.steampowered.com/api/appdetails?appids=${steamId}" target="_blank" class="btn secondary">
                    Open API URL Directly
                </a>
            </div>
        `;
    }
}

function displayStoreInfo(data, steamId, container) {
    const gameData = data[steamId];
    
    if (!gameData || !gameData.success) {
        container.innerHTML = `<div class="error">No data found for Steam ID: ${steamId}</div>`;
        return;
    }
    
    const game = gameData.data;
    let html = '<div class="success">Store information loaded successfully!</div>';
    html += '<h3>Game Information:</h3>';
    
    html += `
        <div class="game-item">
            <h4>${game.name}</h4>
            <p><strong>Type:</strong> ${game.type}</p>
            <p><strong>App ID:</strong> ${game.steam_appid}</p>
            ${game.short_description ? `<p><strong>Description:</strong> ${game.short_description}</p>` : ''}
            ${game.developers ? `<p><strong>Developers:</strong> ${game.developers.join(', ')}</p>` : ''}
            ${game.publishers ? `<p><strong>Publishers:</strong> ${game.publishers.join(', ')}</p>` : ''}
            ${game.release_date ? `<p><strong>Release Date:</strong> ${game.release_date.date}</p>` : ''}
            ${game.price_overview ? `<p><strong>Price:</strong> ${game.price_overview.final_formatted}</p>` : ''}
            ${game.genres ? `<p><strong>Genres:</strong> ${game.genres.map(g => g.description).join(', ')}</p>` : ''}
            ${game.header_image ? `<img src="${game.header_image}" alt="${game.name}" style="max-width: 100%; border-radius: 8px; margin-top: 1rem;">` : ''}
        </div>
    `;
    
    container.innerHTML = html;
}

// Search functionality for apps
document.getElementById('search-apps').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchSteamApps();
    }
});

// Enter key handlers for Steam ID inputs
document.getElementById('steam-id-download').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        downloadGame();
    }
});

document.getElementById('steam-id-store').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchStoreInfo();
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
});
