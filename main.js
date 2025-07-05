const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const apikeys_file = 'apikeys.json';

app.get('/', async (req, res) => {
    // Ambil API Key dari query
    const apikey = req.query.apikey || '';

    // Cek file apikeys.json ada/tidak
    if (!fs.existsSync(apikeys_file)) {
        return res.status(500).json({
            status: 'error',
            message: 'API Key database not found',
            copyright: '@LUTIFY'
        });
    }

    // Baca dan parsing apikeys.json
    let apikeys_data;
    try {
        apikeys_data = JSON.parse(fs.readFileSync(apikeys_file));
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: 'API Key database corrupt',
            copyright: '@LUTIFY'
        });
    }

    // Cari key
    const keydata = apikeys_data.find(d => d.key === apikey);
    if (!keydata) {
        return res.status(401).json({
            status: 'error',
            message: 'API Key tidak valid!',
            copyright: '@LUTIFY'
        });
    }

    // Cek expired pakai Date object
    const today = new Date();
    const expires = new Date(keydata.expires); // pastikan "YYYY-MM-DD"
    if (today > expires) {
        return res.status(403).json({
            status: 'error',
            message: 'API Key expired!',
            copyright: '@LUTIFY'
        });
    }

    // Lanjut validasi parameter utama
    const username = req.query.username || '';
    const domain   = req.query.domain || '';
    const password = req.query.password || '';
    const phone    = '6282127001314';

    if (!username || !domain || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Parameter kurang lengkap',
            copyright: '@LUTIFY'
        });
    }

    // Endpoint API tujuan
    const target_api = `https://amfcode.my.id/apiviu/27juli?username=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}&password=${encodeURIComponent(password)}&phone=${phone}`;

    try {
        const response = await fetch(target_api, {
            headers: { "Authorization": "Bearer AMFCODE" }
        });
        const httpcode = response.status;
        const respText = await response.text();

        try {
            const respJson = JSON.parse(respText);
            respJson.copyright = '@LUTIFY';
            res.status(httpcode).json(respJson);
        } catch (parseErr) {
            console.error('Gagal parse JSON dari API target:', parseErr);
            console.error('Respon mentah dari API target:', respText);
            res.status(httpcode).json({
                status: 'error',
                message: 'API target error / bukan JSON',
                copyright: '@LUTIFY'
            });
        }
    } catch (err) {
        console.error('ERROR request ke API target:', err);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi error pada server',
            copyright: '@LUTIFY'
        });
    }
});

// Jalankan server pada port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Akses: http://localhost:3000/?apikey=123456&username=ISI&domain=ISI&password=ISI');
});
