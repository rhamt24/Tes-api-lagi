document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-button').addEventListener('click', async function() {
        const query = document.getElementById('search-query').value;
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();

        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        data.tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.classList.add('track');
            trackElement.innerHTML = `
                <img src="${track.thumbnail}" alt="Thumbnail">
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>Duration: ${track.duration}</p>
                    <button onclick="playTrack('${track.id}')">Play</button>
                    <button onclick="downloadTrack('${track.id}')">Download</button>
                </div>
            `;
            resultsContainer.appendChild(trackElement);
        });
    });

    window.playTrack = async function(id) {
        const response = await fetch(`/api/getTrack?id=${id}`);
        const data = await response.json();
        const musicContainer = document.getElementById('music-container');
        const mainAudio = document.getElementById('main-audio');

        showMusicContainer(data.track, data.audioSrc);

        mainAudio.src = data.audioSrc;
        mainAudio.play();
    };

    window.downloadTrack = async function(id) {
        const response = await fetch(`/api/download?id=${id}`);
        const data = await response.json();
        window.location.href = data.downloadUrl;
    };

    document.getElementById('mode-button').addEventListener('click', function() {
        document.body.classList.toggle('night-mode');
        this.textContent = document.body.classList.contains('night-mode') ? 'Light Mode' : 'Night Mode';

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
        const homeTrack = document.getElementById('home-track');

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
        musicContainer.classList.add('show');
    }

    function hideMusicContainer() {
        const musicContainer = document.getElementById('music-container');
        const mainAudio = document.getElementById('main-audio');
        mainAudio.pause();
        musicContainer.classList.remove('show');
    }
});
