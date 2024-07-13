const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

process.env['SPOTIFY_CLIENT_ID'] = '4c4fc8c3496243cbba99b39826e2841f';
process.env['SPOTIFY_CLIENT_SECRET'] = 'd598f89aba0946e2b85fb8aefa9ae4c8';

function convert(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

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

app.get('/search', async (req, res) => {
    const { query, type, limit } = req.query;
    const result = await searching(query, type, limit);
    res.json(result);
});

app.get('/download', async (req, res) => {
    const trackId = req.query.id;
    const creds = await spotifyCreds();
    if (!creds.status) return res.json(creds);
    try {
        const trackInfo = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${creds.data.access_token}`
            }
        });
        const downloadUrl = `https://api.fabdl.com/spotify/get?url=${encodeURIComponent(trackInfo.data.external_urls.spotify)}`;
        const downloadResponse = await axios.get(downloadUrl);
        const fullTrack = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${downloadResponse.data.result.gid}/${downloadResponse.data.result.id}`, {
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
        const result = {
            title: trackInfo.data.name,
            type: trackInfo.data.type,
            artist: trackInfo.data.artists.map(artist => artist.name).join(', '),
            duration: convert(trackInfo.data.duration_ms),
            image: trackInfo.data.album.images[0].url,
            download: `https://api.fabdl.com${fullTrack.data.result.download_url}`
        };
        res.json({
            status: true,
            data: result
        });
    } catch (e) {
        res.json({
            status: false,
            msg: e.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
