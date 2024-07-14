document.getElementById('search-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = document.getElementById('search-query').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Searching...';

    const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.status) {
        resultsDiv.innerHTML = '';
        for (const track of data.data) {
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
            audio.style.width = '100%';

            const downloadResponse = await fetch(`/download?id=${track.id}`);
            const downloadData = await downloadResponse.json();
            if (downloadData.status) {
                const source = document.createElement('source');
                source.src = downloadData.data.download;
                source.type = 'audio/mpeg';
                source.setAttribute('title', track.title);
                audio.appendChild(source);
                audio.addEventListener('play', function() {
                    showMusicContainer(track, downloadData.data.download);
                });
            } else {
                const source = document.createElement('source');
                source.src = track.preview;
                source.type = 'audio/mpeg';
                source.setAttribute('title', track.title);
                audio.appendChild(source);
                audio.addEventListener('play', function() {
                    showMusicContainer(track, track.preview);
                });
            }
            trackInfoDiv.appendChild(audio);

            const downloadButton = document.createElement('button');
            downloadButton.className = 'download-btn';
            downloadButton.textContent = 'Download';
            downloadButton.onclick = () => {
                if (downloadData.status) {
                    window.location.href = downloadData.data.download;
                } else {
                    alert('Failed to download track.');
                }
            };
            trackInfoDiv.appendChild(downloadButton);

            trackDiv.appendChild(trackInfoDiv);
            resultsDiv.appendChild(trackDiv);
        }

        document.getElementById('back-button').style.display = 'block';
        document.getElementById('search-form').style.display = 'none';
        document.getElementById('home-footer').style.display = 'none';
    } else {
        resultsDiv.textContent = 'No tracks found!';
    }
});

document.getElementById('back-button').addEventListener('click', function() {
    document.getElementById('search-form').style.display = 'flex';
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('results').innerHTML = '';
    document.getElementById('home-footer').style.display = 'block';
});

document.getElementById('toggle-mode').addEventListener('click', function() {
    document.body.classList.toggle('night-mode');
    const toggleButton = document.getElementById('toggle-mode');
    toggleButton.textContent = document.body.classList.contains('night-mode') ? 'Light Mode' : 'Night Mode';

    const searchInput = document.getElementById('search-query');
    if (document.body.classList.contains('night-mode')) {
        searchInput.classList.add('night-mode');
    } else {
        searchInput.classList.remove('night-mode');
    }
});

document.getElementById('creator-button').addEventListener('click', function() {
    window.location.href = 'https://zals.zalxzhu.my.id'; // Replace with your website URL
});

document.getElementById('close-music').addEventListener('click', function() {
    hideMusicContainer();
});

function showMusicContainer(track, audioSrc) {
    const musicContainer = document.getElementById('music-container');
    const mainAudio = document.getElementById('main-audio');
    const homeTrack = document.getElementById('home-track');

    mainAudio.src = audioSrc;
    homeTrack.innerHTML = `
        <div class="track">
            <img src="${track.thumbnail}" alt="Thumbnail">
            <div class="track-info">
                <h3>${track.title}</h3>
                <p>Duration: ${track.duration}</p>
                <audio controls>
                    <source src="${audioSrc}" type="audio/mpeg">
                </audio>
            </div>
        </div>
    `;
    musicContainer.style.display = 'block';
}

function hideMusicContainer() {
    const musicContainer = document.getElementById('music-container');
    const mainAudio = document.getElementById('main-audio');
    mainAudio.pause();
    musicContainer.style.display = 'none';
}
