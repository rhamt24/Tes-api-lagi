let currentTrackIndex = -1;
let tracks = [];
let autoPlay = false;

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
        for (const [index, track] of tracks.entries()) {
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
            const source = document.createElement('source');
            source.src = downloadData.status ? downloadData.data.download : track.preview;
            source.type = 'audio/mpeg';
            source.setAttribute('title', track.title);
            audio.appendChild(source);

            audio.addEventListener('play', function() {
                stopOtherAudios(audio);
                showMusicContainer(index, source.src, track.title);
            });

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
    window.location.href = 'https://zals.zalxzhu.my.id';
});

document.getElementById('close-music').addEventListener('click', function() {
    hideMusicContainer();
});

document.getElementById('prev').addEventListener('click', function() {
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
        playCurrentTrack();
    }
});

document.getElementById('play-pause').addEventListener('click', function() {
    const mainAudio = document.getElementById('main-audio');
    if (mainAudio.paused) {
        mainAudio.play();
        document.getElementById('play-pause').textContent = 'Pause';
    } else {
        mainAudio.pause();
        document.getElementById('play-pause').textContent = 'Play';
    }
});

document.getElementById('next').addEventListener('click', function() {
    if (currentTrackIndex < tracks.length - 1) {
        currentTrackIndex++;
        playCurrentTrack();
    }
});

document.getElementById('auto-play').addEventListener('click', function() {
    autoPlay = !autoPlay;
    document.getElementById('auto-play').textContent = `Auto Play: ${autoPlay ? 'On' : 'Off'}`;
});

function showMusicContainer(index, audioSrc, title) {
    const musicContainer = document.getElementById('music-container');
    const mainAudio = document.getElementById('main-audio');
    mainAudio.src = audioSrc;
    document.getElementById('current-track-title').textContent = title;
    musicContainer.style.display = 'block';
    mainAudio.play();
    document.getElementById('play-pause').textContent = 'Pause';

    mainAudio.addEventListener('ended', function() {
        if (autoPlay && currentTrackIndex < tracks.length - 1) {
            currentTrackIndex++;
            playCurrentTrack();
        }
    });

    currentTrackIndex = index;
}

function hideMusicContainer() {
    const musicContainer = document.getElementById('music-container');
    const mainAudio = document.getElementById('main-audio');
    mainAudio.pause();
    musicContainer.style.display = 'none';
}

function stopOtherAudios(currentAudio) {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        if (audio !== currentAudio) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
}

function playCurrentTrack() {
    const track = tracks[currentTrackIndex];
    fetch(`/download?id=${track.id}`).then(response => response.json()).then(downloadData => {
        const audioSrc = downloadData.status ? downloadData.data.download : track.preview;
        showMusicContainer(currentTrackIndex, audioSrc, track.title);
    });
}
