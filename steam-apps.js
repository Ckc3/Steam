
document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refreshBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const gamesGrid = document.getElementById('gamesGrid');
    
    let gameData = null;
    let steamAppsList = null;
    
    // Load initial data
    loadData();
    
    async function loadData() {
        try {
            showLoading();
            
            // Load game database
            await loadGameData();
            
            // Load Steam apps list
            await loadSteamAppsList();
            
            // Display random games
            displayRandomGames();
            
        } catch (error) {
            console.error('Failed to load data:', error);
            showError();
        }
    }
    
    async function loadGameData() {
        try {
            console.log('Loading game data...');
            const response = await fetch('https://fares.top/game_data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            gameData = await response.json();
            console.log('Game data loaded successfully:', Object.keys(gameData).length, 'games found');
        } catch (error) {
            console.error('Failed to load game data:', error);
            
            try {
                console.log('Trying alternative proxy for game data...');
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://fares.top/game_data.json');
                const response = await fetch(proxyUrl);
                gameData = await response.json();
                console.log('Game data loaded successfully via proxy');
            } catch (proxyError) {
                console.error('Proxy fetch also failed:', proxyError);
                throw proxyError;
            }
        }
    }
    
    async function loadSteamAppsList() {
        try {
            console.log('Loading Steam apps list...');
            const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v0002/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            steamAppsList = data.applist.apps;
            console.log('Steam apps list loaded:', steamAppsList.length, 'apps found');
        } catch (error) {
            console.error('Failed to load Steam apps list:', error);
            
            try {
                console.log('Trying alternative proxy for Steam apps...');
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://api.steampowered.com/ISteamApps/GetAppList/v0002/');
                const response = await fetch(proxyUrl);
                const data = await response.json();
                steamAppsList = data.applist.apps;
                console.log('Steam apps list loaded successfully via proxy');
            } catch (proxyError) {
                console.error('Steam apps proxy fetch also failed:', proxyError);
                throw proxyError;
            }
        }
    }
    
    function displayRandomGames() {
        if (!gameData || !steamAppsList) {
            showError();
            return;
        }
        
        // Get available game IDs from our database
        const availableGameIds = Object.keys(gameData);
        
        if (availableGameIds.length < 3) {
            showError();
            return;
        }
        
        // Select 3 random games
        const randomGames = getRandomGames(availableGameIds, 3);
        
        // Clear previous content
        gamesGrid.innerHTML = '';
        
        // Create game cards
        randomGames.forEach(gameId => {
            const game = gameData[gameId];
            const gameCard = createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
        
        hideAllMessages();
        gamesGrid.classList.remove('hidden');
    }
    
    function getRandomGames(gameIds, count) {
        const shuffled = [...gameIds].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'random-game-card';
        
        // Use Steam's official CDN for images
        const steamImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.game_id}/header.jpg`;
        
        card.innerHTML = `
            <div class="random-game-image-container">
                <img src="${steamImageUrl}" alt="${game.game_name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEzNSIgdmlld0JveD0iMCAwIDE4MCAxMzUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iMTM1IiBmaWxsPSIjZjFmNWY5IiBzdHJva2U9IiNlMmU4ZjAiLz4KPHR5cGU+Tm8gSW1hZ2U8L3RleHQ+Cjx0ZXh0IHg9IjkwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'" />
            </div>
            <div class="random-game-info">
                <h3 class="random-game-title">${game.game_name}</h3>
                <div class="random-game-details">
                    <div class="random-detail-item">
                        <span class="random-label">Game ID:</span>
                        <span class="random-value">${game.game_id}</span>
                    </div>
                    <div class="random-detail-item">
                        <span class="random-label">Zip File:</span>
                        <span class="random-value">${game.zip_file}</span>
                    </div>
                </div>
                <div class="random-game-actions">
                    <button class="btn btn-secondary btn-small" onclick="downloadGame('${game.game_id}')">
                        Download
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="viewInLookup('${game.game_id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    function showLoading() {
        hideAllMessages();
        loadingMessage.classList.remove('hidden');
    }
    
    function showError() {
        hideAllMessages();
        errorMessage.classList.remove('hidden');
    }
    
    function hideAllMessages() {
        loadingMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        gamesGrid.classList.add('hidden');
    }
    
    // Event listeners
    refreshBtn.addEventListener('click', displayRandomGames);
    
    // Global functions for button actions
    window.downloadGame = function(gameId) {
        const downloadUrl = `https://steamdatabase.s3.eu-north-1.amazonaws.com/${gameId}.zip`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${gameId}.zip`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Download started for game ID: ${gameId}`);
    };
    
    window.viewInLookup = function(gameId) {
        window.location.href = `game-lookup.html?id=${gameId}`;
    };
});
