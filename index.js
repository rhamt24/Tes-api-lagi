const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

process.env['SPOTIFY_CLIENT_ID'] = '4c4fc8c3496243cbba99b39826e2841f';
process.env['SPOTIFY_CLIENT_SECRET'] = 'd598f89aba0946e2b85fb8aefa9ae4c8';

async function convert(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

async function spotifyCreds() {
    return new Promise(async resolve => {
        try {
            const json = await (await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                headers: {
                    Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
                }
            })).data;
            if (!json.access_token) return resolve({
                creator: 'Budy x creator',
                status: false,
                msg: 'Can\'t generate token!'
            });
            resolve({
                creator: 'Budy x creator',
                status: true,
                data: json
            });
        } catch (e) {
            resolve({
                creator: 'Budy x creator',
                status: false,
                msg: e.message
            });
        }
    });
}

async function searching(query, type = 'track', limit = 20) {
    return new Promise(async resolve => {
        try {
            const creds = await spotifyCreds();
            if (!creds.status) return resolve(creds);
            const json = await (await axios.get('https://api.spotify.com/v1/search?query=' + query + '&type=' + type + '&offset=0&limit=' + limit, {
                headers: {
                    Authorization: 'Bearer ' + creds.data.access_token
                }
            })).data;
            if (!json.tracks.items || json.tracks.items.length < 1) return resolve({
                creator: 'Budy x creator',
                status: false,
                msg: 'Music not found!'
            });
            let data = [];
            json.tracks.items.map(v => data.push({
                title: v.album.artists[0].name + ' - ' + v.name,
                duration: convert(v.duration_ms),
                popularity: v.popularity + '%',
                preview: v.preview_url,
                url: v.external_urls.spotify,
                id: v.id,
                thumbnail: v.album.images[0].url // Adding the thumbnail URL
            }));
            resolve({
                creator: 'Budy x creator',
                status: true,
                data
            });
        } catch (e) {
            resolve({
                creator: 'Budy x creator',
                status: false,
                msg: e.message
            });
        }
    });
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
        const json = await (await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: 'Bearer ' + creds.data.access_token
            }
        })).data;

        const downloadUrl = json.preview_url;
        if (!downloadUrl) return res.json({
            status: false,
            msg: 'Preview URL not available for this track.'
        });

        res.redirect(downloadUrl);
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
