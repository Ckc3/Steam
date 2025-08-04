



function downloadGame(gameId) {
    const downloadUrl = `https://steamdatabase1.s3.eu-north-1.amazonaws.com/${gameId}.zip`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${gameId}.zip`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Download started for game ID: ${gameId}`);
}


function viewInLookup(gameId) {
    window.location.href = `game-lookup.html?id=${gameId}`;
}


function showLoadingState(element, text = 'Loading...') {
    element.innerHTML = `
        <div class="spinner"></div>
        <span>${text}</span>
    `;
    element.classList.remove('hidden');
}


function showErrorState(element, text = 'An error occurred') {
    element.innerHTML = `<span class="error-text">${text}</span>`;
    element.classList.remove('hidden');
}


function hideAllStatusMessages(loadingEl, errorEl, resultEl) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    if (resultEl) resultEl.classList.add('hidden');
}


async function loadGameDataWithFallback(url) {
    try {
        console.log('Loading game data...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Game data loaded successfully:', Object.keys(data).length, 'games found');
        return data;
    } catch (error) {
        console.error('Failed to load game data:', error);
        
        try {
            console.log('Trying alternative proxy...');
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            const data = await response.json();
            console.log('Game data loaded successfully via proxy');
            return data;
        } catch (proxyError) {
            console.error('Proxy fetch also failed:', proxyError);
            throw proxyError;
        }
    }
}


if (typeof window !== 'undefined') {
    window.downloadGame = downloadGame;
    window.viewInLookup = viewInLookup;
    window.showLoadingState = showLoadingState;
    window.showErrorState = showErrorState;
    window.hideAllStatusMessages = hideAllStatusMessages;
    window.loadGameDataWithFallback = loadGameDataWithFallback;
}
