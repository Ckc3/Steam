document.addEventListener('DOMContentLoaded', function() {
    const steamIdInput = document.getElementById('steamIdInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadMessage = document.getElementById('downloadMessage');

    function downloadGame() {
        const steamId = steamIdInput.value.trim();

        if (!steamId) {
            return;
        }

        if (!/^\d+$/.test(steamId)) {
            showDownloadStatus('Please enter a valid Steam ID (numbers only)', 'error');
            return;
        }

        showDownloadStatus('Preparing download...', 'info');

        setTimeout(() => {
            const downloadUrl = `https://steamdatabase1.s3.eu-north-1.amazonaws.com/${steamId}.zip`;

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${steamId}.zip`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showDownloadStatus(`Download started for game ID: ${steamId}`, 'success');
            console.log(`Download started for game ID: ${steamId}`);


            setTimeout(() => {
                downloadMessage.classList.add('hidden');
            }, 3000);
        }, 500);
    }

    function showDownloadStatus(message, type) {
        downloadMessage.className = `status-message download-info ${type === 'error' ? 'error' : 'download-info'}`;
        downloadMessage.innerHTML = `<span class="download-text">${message}</span>`;
        downloadMessage.classList.remove('hidden');
    }


    downloadBtn.addEventListener('click', downloadGame);

    steamIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            downloadGame();
        }
    });


    document.querySelectorAll('.download-example-btn').forEach(button => {
        button.addEventListener('click', function() {
            const steamId = this.getAttribute('data-steamid');
            steamIdInput.value = steamId;
            downloadGame();
        });
    });
});