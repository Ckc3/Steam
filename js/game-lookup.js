
document.addEventListener('DOMContentLoaded', function() {
    const gameSearch = document.getElementById('gameSearch');
    const searchBtn = document.getElementById('searchBtn');
    const gameResult = document.getElementById('gameResult');
    const errorMessage = document.getElementById('errorMessage');
    const loadingMessage = document.getElementById('loadingMessage');
    
    const gameImage = document.getElementById('gameImage');
    const gameName = document.getElementById('gameName');
    const gameId = document.getElementById('gameId');
    const zipFile = document.getElementById('zipFile');
    
    let gameData = null;
    

    loadGameData();
    
    async function loadGameData() {
        try {
            gameData = await loadGameDataWithFallback('https://fares.top/game_data.json');
        } catch (error) {
            showErrorState(errorMessage, 'Unable to load game database. Please try again later.');
        }
    }
    
    function searchGame() {
        const searchTerm = gameSearch.value.trim().toLowerCase();
        
        if (!searchTerm) {
            return;
        }
        
        if (!gameData) {
            hideAllStatusMessages(loadingMessage, errorMessage, gameResult);
            showErrorState(errorMessage, 'Game data not loaded. Please try again.');
            return;
        }
        
        hideAllStatusMessages(loadingMessage, errorMessage, gameResult);
        showLoadingState(loadingMessage, 'Searching games...');
        
        setTimeout(() => {
            let foundGame = null;
            

            if (gameData[searchTerm]) {
                foundGame = gameData[searchTerm];
                console.log('Found by exact ID:', searchTerm, foundGame);
            } else {

                for (const [id, game] of Object.entries(gameData)) {
                    if (game.game_name.toLowerCase().includes(searchTerm)) {
                        foundGame = game;
                        console.log('Found by name search:', searchTerm, foundGame);
                        break;
                    }
                }
                

                
                if (!foundGame && /^\d+$/.test(searchTerm)) {
                    for (const [id, game] of Object.entries(gameData)) {
                        if (game.game_id && game.game_id.toString() === searchTerm) {
                            foundGame = game;
                            console.log('Found by game_id field:', searchTerm, foundGame);
                            break;
                        }
                    }
                }
            }
            
            hideAllStatusMessages(loadingMessage, errorMessage, gameResult);
            
            if (foundGame) {
                displayGame(foundGame);
            } else {
                console.log('No game found for search term:', searchTerm);
                showErrorState(errorMessage, 'Game not found. Please try a different search term.');
            }
        }, 500);
    }
    
    function displayGame(game) {
        gameName.textContent = game.game_name;
        gameId.textContent = game.game_id;
        zipFile.textContent = game.zip_file;
        

        const steamImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.game_id}/header.jpg`;
        gameImage.src = steamImageUrl;
        gameImage.alt = game.game_name;
        
        gameImage.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDE1MCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjI1IiBmaWxsPSIjNDAzZTQzIiBzdHJva2U9IiM1YTU1NWEiLz4KPHR5cGU+Tm8gSW1hZ2U8L3RleHQ+Cjx0ZXh0IHg9Ijc1IiB5PSIxMTIuNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
        };
        
        gameResult.classList.remove('hidden');
    }
    

    searchBtn.addEventListener('click', searchGame);
    
    gameSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchGame();
        }
    });
    
    gameSearch.addEventListener('input', function() {
        if (!this.value.trim()) {
            hideAllStatusMessages(loadingMessage, errorMessage, gameResult);
        }
    });
    

    document.querySelectorAll('.suggestion-btn').forEach(button => {
        button.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            gameSearch.value = searchTerm;
            searchGame();
        });
    });
});
