// Variables
let tracks = [];
let currentTrackIndex = 0;
let autoPlay = false;
let favoritePlaylist = [];

// Search functionality
document.getElementById('search-form').addEventListener('submit', async function (e) {
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

            const trackInfoDiv = document.createElement('div');
            trackInfoDiv.className = 'track-info';
            trackInfoDiv.innerHTML = `
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            `;

            const favoriteButton = createFavoriteButton(track);
            const playButton = document.createElement('button');
            playButton.className = 'button green';
            playButton.textContent = 'Play';
            playButton.onclick = () => playTrack(index);

            trackDiv.appendChild(trackInfoDiv);
            trackDiv.appendChild(favoriteButton);
            trackDiv.appendChild(playButton);

            resultsDiv.appendChild(trackDiv);
        }
    } else {
        resultsDiv.innerHTML = 'No results found.';
    }
});

function createFavoriteButton(track) {
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'button gray';
    favoriteButton.textContent = 'Add to Favorites';
    favoriteButton.onclick = () => addToFavorites(track);
    return favoriteButton;
}

function playTrack(index) {
    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    document.getElementById('current-track-title').textContent = `${track.title} - ${track.artist}`;
    document.getElementById('main-audio').src = track.preview_url;
    document.getElementById('main-audio').play();
    document.getElementById('music-container').style.display = 'block';
}

document.getElementById('prev').onclick = () => {
    if (currentTrackIndex > 0) playTrack(currentTrackIndex - 1);
};

document.getElementById('next').onclick = () => {
    if (currentTrackIndex < tracks.length - 1) playTrack(currentTrackIndex + 1);
    if (autoPlay && currentTrackIndex >= tracks.length - 1) playTrack(0);
};

document.getElementById('play-pause').onclick = () => {
    const audio = document.getElementById('main-audio');
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
};

document.getElementById('auto-play').onclick = () => {
    autoPlay = !autoPlay;
    document.getElementById('auto-play').textContent = `Auto Play: ${autoPlay ? 'On' : 'Off'}`;
};

function addToFavorites(track) {
    favoritePlaylist.push(track);
    alert(`${track.title} added to favorites.`);
}

// User interaction: Login/Register
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");
const userInfoBtn = document.getElementById("user-info-btn");

closeModal.onclick = () => modal.style.display = "none";

document.getElementById("register").onclick = function () {
    modalBody.innerHTML = `
        <h2>Register</h2>
        <label for="username">Username:</label>
        <input type="text" id="reg-username">
        <label for="password">Password:</label>
        <input type="password" id="reg-password">
        <button id="register-submit">Register</button>
    `;
    modal.style.display = "block";

    document.getElementById("register-submit").onclick = function () {
        const username = document.getElementById("reg-username").value;
        const password = document.getElementById("reg-password").value;
        alert(`Registered successfully as ${username}.`);
        modal.style.display = "none";
    };
};

document.getElementById("login").onclick = function () {
    modalBody.innerHTML = `
        <h2>Login</h2>
        <label for="username">Username:</label>
        <input type="text" id="login-username">
        <label for="password">Password:</label>
        <input type="password" id="login-password">
        <button id="login-submit">Login</button>
    `;
    modal.style.display = "block";

    document.getElementById("login-submit").onclick = function () {
        const username = document.getElementById("login-username").value;
        alert(`Logged in successfully as ${username}.`);
        document.getElementById("login").style.display = "none";
        document.getElementById("logout").style.display = "block";
        modal.style.display = "none";
    };
};

document.getElementById("logout").onclick = function () {
    alert("Logged out successfully.");
    document.getElementById("login").style.display = "block";
    document.getElementById("logout").style.display = "none";
};
