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
            audio.src = track.url; // Use full track URL if available
            audio.addEventListener('play', function() {
                stopOtherAudios(audio);
                showMusicContainer(track);
            });
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
});

document.getElementById('creator-button').addEventListener('click', function() {
    window.location.href = 'https://zals.zalxzhu.my.id';
});

const musicContainer = document.getElementById('music-container');
const mainAudio = document.getElementById('main-audio');
let currentTrack = null;

function showMusicContainer(track) {
    currentTrack = track;
    musicContainer.style.display = 'block';
    document.getElementById('current-track-title').textContent = track.title;
    mainAudio.src = track.url; // Use full track URL if available
    mainAudio.currentTime = 0;
    mainAudio.play();
}

document.getElementById('close-music').addEventListener('click', function() {
    musicContainer.style.display = 'none';
    mainAudio.pause();
    mainAudio.src = '';
    currentTrack = null;
});

function stopOtherAudios(currentAudio) {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        if (audio !== currentAudio) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
}

const playPauseButton = document.getElementById('play-pause-button');
playPauseButton.addEventListener('click', function() {
    if (mainAudio.paused) {
        mainAudio.play();
        playPauseButton.textContent = 'Pause';
    } else {
        mainAudio.pause();
        playPauseButton.textContent = 'Play';
    }
});

mainAudio.addEventListener('play', function() {
    playPauseButton.textContent = 'Pause';
});

mainAudio.addEventListener('pause', function() {
    playPauseButton.textContent = 'Play';
});

// Autoplay
let autoplay = false;
const autoplayButton = document.getElementById('autoplay-button');
autoplayButton.addEventListener('click', function() {
    autoplay = !autoplay;
    autoplayButton.textContent = autoplay ? 'Autoplay On' : 'Autoplay Off';
});

mainAudio.addEventListener('ended', function() {
    if (autoplay) {
        playNextTrack();
    }
});

function playNextTrack() {
    const tracks = document.querySelectorAll('.track-info audio');
    const currentIndex = Array.from(tracks).findIndex(audio => audio.src === mainAudio.src);
    if (currentIndex >= 0 && currentIndex < tracks.length - 1) {
        tracks[currentIndex + 1].play();
        showMusicContainer({
            title: tracks[currentIndex + 1].closest('.track-info').querySelector('h3').textContent,
            url: tracks[currentIndex + 1].src
        });
    }
}

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

prevButton.addEventListener('click', function() {
    const tracks = document.querySelectorAll('.track-info audio');
    const currentIndex = Array.from(tracks).findIndex(audio => audio.src === mainAudio.src);
    if (currentIndex > 0) {
        tracks[currentIndex - 1].play();
        showMusicContainer({
            title: tracks[currentIndex - 1].closest('.track-info').querySelector('h3').textContent,
            url: tracks[currentIndex - 1].src
        });
    }
});

nextButton.addEventListener('click', function() {
    playNextTrack();
});
