const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect('mongodb+srv://ZalxZhu:R1e68gv6xEFkBv2o@cluster1.pqkf7ea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Schema dan model untuk User
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Fungsi hash dan verifikasi password
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// Fungsi untuk membuat token JWT
function createToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, 'secretKey', { expiresIn: '1h' });
}

// Route untuk register user
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ status: true, msg: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
    }
});

// Route untuk login user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: false, msg: 'User not found' });
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ status: false, msg: 'Invalid password' });
        }

        const token = createToken(user);
        res.json({ status: true, token });
    } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
    }
});

// Middleware autentikasi menggunakan JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Fungsi untuk konversi durasi dari milidetik ke menit:detik
function convert(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// Fungsi untuk mengambil kredensial Spotify
async function spotifyCreds() {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
            }
        });
        return {
            status: true,
            data: response.data
        };
    } catch (e) {
        return {
            status: false,
            msg: e.message
        };
    }
}

// Fungsi untuk mencari lagu di Spotify
async function searching(query, type = 'track', limit = 20) {
    try {
        const creds = await spotifyCreds();
        if (!creds.status) return creds;
        const response = await axios.get(`https://api.spotify.com/v1/search?query=${query}&type=${type}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${creds.data.access_token}`
            }
        });
        const tracks = response.data.tracks.items;
        const data = tracks.map(track => ({
            title: `${track.artists[0].name} - ${track.name}`,
            duration: convert(track.duration_ms),
            popularity: `${track.popularity}%`,
            preview: track.preview_url,
            url: track.external_urls.spotify,
            id: track.id,
            thumbnail: track.album.images[0].url
        }));
        return {
            status: true,
            data
        };
    } catch (e) {
        return {
            status: false,
            msg: e.message
        };
    }
}

// Fungsi untuk mendapatkan track lengkap dari URL Spotify menggunakan API pihak ketiga
async function getFullTrack(url) {
    try {
        const response = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`);
        const trackId = response.data.result.id;
        const taskResponse = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${response.data.result.gid}/${trackId}`, {
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'sec-ch-ua': '"Not)A;Brand";v="24", "Chromium";v="116"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                Referer: 'https://spotifydownload.org/',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            }
        });
        return `https://api.fabdl.com${taskResponse.data.result.download_url}`;
    } catch (e) {
        return null;
    }
}

// Route untuk mencari lagu di Spotify
app.get('/search', authenticateToken, async (req, res) => {
    const { query, type, limit } = req.query;
    const result = await searching(query, type, limit);
    res.json(result);
});

// Route untuk mengunduh track dari Spotify
app.get('/download', authenticateToken, async (req, res) => {
    const trackId = req.query.id;
    const creds = await spotifyCreds();
    if (!creds.status) return res.json(creds);
    try {
        const trackInfo = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${creds.data.access_token}`
            }
        });
        const downloadUrl = await getFullTrack(trackInfo.data.external_urls.spotify);
        if (downloadUrl) {
            res.json({
                status: true,
                data: {
                    title: trackInfo.data.name,
                    artist: trackInfo.data.artists.map(artist => artist.name).join(', '),
                    duration: convert(trackInfo.data.duration_ms),
                    image: trackInfo.data.album.images[0].url,
                    download: downloadUrl
                }
            });
        } else {
            res.json({
                status: false,
                msg: 'Failed to retrieve full track.'
            });
        }
    } catch (e) {
        res.json({
            status: false,
            msg: e.message
        });
    }
});

// Protected Route contoh
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ status: true, msg: 'This is a protected route', user: req.user });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
