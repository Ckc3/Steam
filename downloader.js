
document.addEventListener('DOMContentLoaded', function() {
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
        
        downloadMessage.className = 'status-message download-info';
        
        if (type === 'error') {
            downloadMessage.style.color = '#f85149';
            downloadMessage.style.background = 'rgba(248, 81, 73, 0.1)';
            downloadMessage.style.borderColor = 'rgba(248, 81, 73, 0.3)';
        } else if (type === 'success') {
            downloadMessage.style.color = '#2ea043';
            downloadMessage.style.background = 'rgba(46, 160, 67, 0.1)';
            downloadMessage.style.borderColor = 'rgba(46, 160, 67, 0.3)';
        } else {
            downloadMessage.style.color = '#58a6ff';
            downloadMessage.style.background = 'rgba(88, 166, 255, 0.1)';
            downloadMessage.style.borderColor = 'rgba(88, 166, 255, 0.3)';
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
