document.addEventListener('DOMContentLoaded', function() {
    const refreshBtn = document.getElementById('refreshBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const gamesGrid = document.getElementById('gamesGrid');

    let gameData = null;
    let steamAppsList = null;


    loadData();

    async function loadData() {
        try {
            showLoadingState(loadingMessage, 'Loading random games...');


            await loadGameData();


            await loadSteamAppsList();


            displayRandomGames();

        } catch (error) {
            console.error('Failed to load data:', error);
            showErrorState(errorMessage, 'Failed to load games. Please try again.');
        }
    }

    async function loadGameData() {
        gameData = await loadGameDataWithFallback('https://fares.top/game_data.json');
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
            showErrorState(errorMessage, 'Failed to load games. Please try again.');
            return;
        }


        const availableGameIds = Object.keys(gameData);

        if (availableGameIds.length < 3) {
            showErrorState(errorMessage, 'Not enough games in database.');
            return;
        }


        const randomGames = getRandomGames(availableGameIds, 3);


        gamesGrid.innerHTML = '';


        randomGames.forEach(gameId => {
            const game = gameData[gameId];
            const gameCard = createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });


        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', downloadAllGames);
        }


        hideAllStatusMessages(loadingMessage, errorMessage, null);
        gamesGrid.classList.remove('hidden');
    }

    function getRandomGames(gameIds, count) {
        const shuffled = [...gameIds].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'random-game-card';


        const steamImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.game_id}/header.jpg`;

        card.innerHTML = `
            <div class="random-game-image-container">
                <img src="${steamImageUrl}" alt="${game.game_name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEzNSIgdmlld0JveD0iMCAwIDE4MCAxMzUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iMTM1IiBmaWxsPSIjNDAzZTQzIiBzdHJva2U9IiM1YTU1NWEiLz4KPHR5cGU+Tm8gSW1hZ2U8L3RleHQ+Cjx0ZXh0IHg9IjkwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'" />
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

    function downloadAllGames() {
        const gameCards = document.querySelectorAll('.random-game-card');

        if (gameCards.length === 0) {
            console.log('No games available to download');
            showErrorState(errorMessage, 'No games available to download');
            return;
        }

        console.log(`Starting download for ${gameCards.length} games`);
        
        gameCards.forEach((card, index) => {
            const gameIdElement = card.querySelector('.random-value');
            if (gameIdElement) {
                const gameId = gameIdElement.textContent;


                
                setTimeout(() => {
                    downloadGame(gameId);
                    console.log(`Download ${index + 1}/${gameCards.length} started for game ID: ${gameId}`);
                }, index * 500);
            }
        });
    }


    refreshBtn.addEventListener('click', displayRandomGames);
    

    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllGames);
    }

    window.viewInLookup = function(gameId) {
        window.location.href = `game-lookup.html?id=${gameId}`;
    };
});
