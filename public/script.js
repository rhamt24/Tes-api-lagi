document.getElementById('search-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    const response = await fetch(`/search?query=${encodeURIComponent(query)}&type=track&limit=10`);
    const data = await response.json();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (data.status) {
        data.data.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'track';

            const thumbnail = document.createElement('img');
            thumbnail.src = track.thumbnail;
            trackDiv.appendChild(thumbnail);

            const trackInfoDiv = document.createElement('div');
            trackInfoDiv.className = 'track-info';

            const title = document.createElement('h3');
            title.textContent = track.title;
            trackInfoDiv.appendChild(title);

            const duration = document.createElement('p');
            duration.textContent = `Duration: ${track.duration}`;
            trackInfoDiv.appendChild(duration);

            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = track.preview;
            trackInfoDiv.appendChild(audio);

            const downloadButton = document.createElement('button');
            downloadButton.className = 'download-btn';
            downloadButton.textContent = 'Download';
            downloadButton.onclick = async () => {
                const downloadResponse = await fetch(`/download?id=${track.id}`);
                const downloadData = await downloadResponse.json();
                if (downloadData.status) {
                    window.location.href = downloadData.data.download;
                } else {
                    alert('Failed to download track.');
                }
            };
            trackInfoDiv.appendChild(downloadButton);

            trackDiv.appendChild(trackInfoDiv);
            resultsDiv.appendChild(trackDiv);
        });

        document.getElementById('back-button').style.display = 'block';
    } else {
        resultsDiv.textContent = 'No tracks found!';
    }
});

document.getElementById('back-button').addEventListener('click', function() {
    document.getElementById('search-form').style.display = 'flex';
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('results').innerHTML = '';
});
