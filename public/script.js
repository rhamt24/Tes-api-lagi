// Fungsi night mode dan light mode serta tombolnya telah dihapus

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
            audio.className = 'search-audio';

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
        document.getElementById('search-form').style.display = 'flex';
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

document.getElementById('creator-button').addEventListener('click', function() {
    window.location.href = 'https://zals.zalxzhu.my.id';
});

document.getElementById('hide-music').addEventListener('click', function() {
    const musicContainer = document.getElementById('music-container');
    musicContainer.style.display = 'none';
});

document.getElementById('close-music').addEventListener('click', function() {
    const musicContainer = document.getElementById('music-container');
    musicContainer.style.display = 'none';
    const mainAudio = document.getElementById('main-audio');
    mainAudio.pause();
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
    const searchAudios = document.querySelectorAll('.search-audio');

    stopOtherAudios(mainAudio);

    mainAudio.src = audioSrc;
    document.getElementById('current-track-title').textContent = title;
    musicContainer.style.display = 'block';
    mainAudio.play();
    document.getElementById('play-pause').textContent = 'Pause';

    mainAudio.addEventListener('play', function() {
        searchAudios.forEach(audio => {
            audio.currentTime = mainAudio.currentTime;
            audio.pause();
        });
    });

    mainAudio.addEventListener('pause', function() {
        searchAudios.forEach(audio => {
            audio.pause();
        });
    });

    mainAudio.addEventListener('ended', function() {
        if (autoPlay && currentTrackIndex < tracks.length - 1) {
            currentTrackIndex++;
            playCurrentTrack();
        }
    });

    currentTrackIndex = index;
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
    
