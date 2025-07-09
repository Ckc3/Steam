
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
                console.log('Trying alternative proxy...');
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://fares.top/game_data.json');
                const response = await fetch(proxyUrl);
                gameData = await response.json();
                console.log('Game data loaded successfully via proxy');
            } catch (proxyError) {
                console.error('Proxy fetch also failed:', proxyError);
                

                document.getElementById('errorMessage').innerHTML = `
                    <span class="error-text">Unable to load game database. Please try again later.</span>
                `;
                document.getElementById('errorMessage').classList.remove('hidden');
            }
        }
    }
    
    function hideAllMessages() {
        gameResult.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loadingMessage.classList.add('hidden');
    }
    
    function searchGame() {
        const searchTerm = gameSearch.value.trim().toLowerCase();
        
        if (!searchTerm) {
            return;
        }
        
        if (!gameData) {
            hideAllMessages();
            errorMessage.textContent = 'Game data not loaded. Please try again.';
            errorMessage.classList.remove('hidden');
            return;
        }
        
        hideAllMessages();
        loadingMessage.classList.remove('hidden');
        

        setTimeout(() => {
            let foundGame = null;
            

            if (gameData[searchTerm]) {
                foundGame = gameData[searchTerm];
            } else {

                for (const [id, game] of Object.entries(gameData)) {
                    if (game.game_name.toLowerCase().includes(searchTerm)) {
                        foundGame = game;
                        break;
                    }
                }
            }
            
            hideAllMessages();
            
            if (foundGame) {
                displayGame(foundGame);
            } else {
                errorMessage.classList.remove('hidden');
            }
        }, 500);
    }
    
    function displayGame(game) {
        gameName.textContent = game.game_name;
        gameId.textContent = game.game_id;
        zipFile.textContent = game.zip_file;
        gameImage.src = game.image_url;
        gameImage.alt = game.game_name;
        

        gameImage.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDE1MCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjI1IiBmaWxsPSIjY2NjIi8+Cjx0ZXh0IHg9Ijc1IiB5PSIxMTIuNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
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
            hideAllMessages();
        }
    });
    

    document.querySelectorAll('.suggestion-btn').forEach(button => {
        button.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            gameSearch.value = searchTerm;
            searchGame();
        });
    });
    

    const steamIdInput = document.getElementById('steamIdInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadMessage = document.getElementById('downloadMessage');
    
    function downloadSteamId() {
        const steamId = steamIdInput.value.trim();
        
        if (!steamId) {
            showDownloadMessage('Please enter a Steam ID', 'error');
            return;
        }
        
        if (!/^\d+$/.test(steamId)) {
            showDownloadMessage('Steam ID must be numeric', 'error');
            return;
        }
        
        showDownloadMessage('Preparing download...', 'info');
        
        setTimeout(() => {
            const downloadUrl = `https://steamdatabase.s3.eu-north-1.amazonaws.com/${steamId}.zip`;
            

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${steamId}.zip`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showDownloadMessage(`Download started for Steam ID ${steamId}`, 'success');
            

            setTimeout(() => {
                downloadMessage.classList.add('hidden');
            }, 3000);
        }, 500);
    }
    
    function showDownloadMessage(message, type) {
        const messageElement = downloadMessage.querySelector('.download-text');
        messageElement.textContent = message;
        

        downloadMessage.className = 'download-info';
        
        if (type === 'error') {
            downloadMessage.style.color = '#ff6b6b';
            downloadMessage.style.background = 'rgba(255, 107, 107, 0.1)';
            downloadMessage.style.borderColor = 'rgba(255, 107, 107, 0.3)';
        } else if (type === 'success') {
            downloadMessage.style.color = '#4ade80';
            downloadMessage.style.background = 'rgba(74, 222, 128, 0.1)';
            downloadMessage.style.borderColor = 'rgba(74, 222, 128, 0.3)';
        } else {
            downloadMessage.style.color = '#66c0f4';
            downloadMessage.style.background = 'rgba(102, 192, 244, 0.1)';
            downloadMessage.style.borderColor = 'rgba(102, 192, 244, 0.3)';
        }
        
        downloadMessage.classList.remove('hidden');
    }
    

    downloadBtn.addEventListener('click', downloadSteamId);
    

    steamIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            downloadSteamId();
        }
    });
    

    document.querySelectorAll('.download-example-btn').forEach(button => {
        button.addEventListener('click', function() {
            const steamId = this.getAttribute('data-steamid');
            steamIdInput.value = steamId;
            downloadSteamId();
        });
    });
});
