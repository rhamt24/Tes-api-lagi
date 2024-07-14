let currentTrackIndex = -1;
let tracks = [];
let isAutoplay = false;

document.getElementById('search-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = document.getElementById('search-query').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Searching...';

    const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.status) {
        resultsDiv.innerHTML = '';
        tracks = data.data;
        currentTrackIndex = 0;

        for (const track of tracks) {
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
            audio.addEventListener('play', function() {
                showMusicContainer(audio, track.title);
            });

            const downloadResponse = await fetch(`/download?id=${track.id}`);
            const downloadData = await downloadResponse.json();
            if (downloadData.status) {
                const source = document.createElement('source');
                source.src = downloadData.data.download;
                source.type = 'audio/mpeg';
                source.setAttribute('title', track.title);
                audio.appendChild(source);
            } else {
                const source = document.createElement('source');
                source.src = track.preview;
                source.type = 'audio/mpeg';
                source.setAttribute('title', track.title);
                audio.appendChild(source);
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

document.getElementById('prev-button').addEventListener('click', function() {
    playPreviousTrack();
});

document.getElementById('next-button').addEventListener('click', function() {
    playNextTrack();
});

document.getElementById('autoplay-button').addEventListener('click', function() {
    isAutoplay = !isAutoplay;
    this.textContent = isAutoplay ? 'Autoplay On' : 'Autoplay Off';
});

document.getElementById('play-pause-button').addEventListener('click', function() {
    const mainAudio = document.getElementById('main-audio');
    if (mainAudio.paused) {
        mainAudio.play();
        this.textContent = 'Pause';
    } else {
        mainAudio.pause();
        this.textContent = 'Play';
    }
});

function showMusicContainer(audio, title) {
    const musicContainer = document.getElementById('music-container');
    const mainAudio = document.getElementById('main-audio');
    const trackTitle = document.getElementById('current-track-title');

    trackTitle.textContent = title;
    syncAudioTime(audio, mainAudio);
    musicContainer.style.display = 'block';

    mainAudio.addEventListener('ended', function() {
        if (isAutoplay) {
            playNextTrack();
        }
    });
}

function hideMusicContainer() {
    const musicContainer = document.getElementById('music-container');
    const mainAudio = document.getElementById('main-audio');
    mainAudio.pause();
    musicContainer.style.display = 'none';
}

function playPreviousTrack() {
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
        playTrack();
    }
}

function playNextTrack() {
    if (currentTrackIndex < tracks.length - 1) {
        currentTrackIndex++;
        playTrack();
    }
}

function playTrack() {
    const track = tracks[currentTrackIndex];
    const mainAudio = document.getElementById('main-audio');
    const trackTitle = document.getElementById('current-track-title');

    const audioSrc = track.preview;
    trackTitle.textContent = track.title;
    mainAudio.src = audioSrc;
    mainAudio.play();
}

function syncAudioTime(sourceAudio, targetAudio) {
    targetAudio.currentTime = sourceAudio.currentTime;
    sourceAudio.addEventListener('timeupdate', () => {
        targetAudio.currentTime = sourceAudio.currentTime;
    });
}
