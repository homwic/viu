const express = require('express');
const fetch = require('node-fetch'); // Pastikan pakai node-fetch versi 2.x

const app = express();

app.get('/', async (req, res) => {
    // Ambil parameter dari URL
    const username = req.query.username || '';
    const domain   = req.query.domain || '';
    const password = req.query.password || '';
    const paket    = req.query.paket || '1'; // Default ke paket 1

    // Validasi parameter user
    if (!username || !domain || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Parameter kurang lengkap',
            copyright: '@LUTIFY'
        });
    }

    // Tentukan nomor telepon berdasarkan paket
    let phone = '';
    if (paket === '1') {
        phone = '6281328345758'; // Paket 1
    } else if (paket === '200') {
        phone = '6282199189441'; // Paket 200
    } else {
        return res.status(400).json({
            status: 'error',
            message: 'Paket tidak valid',
            copyright: '@LUTIFY'
        });
    }

    // Endpoint API tujuan
    const target_api = `https://amfcode.my.id/apiviu/27juli?username=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}&password=${encodeURIComponent(password)}&phone=${phone}`;

    try {
        // Kirim request ke API tujuan
        const response = await fetch(target_api, {
            headers: {
                "Authorization": "Bearer AMFCODE"
            }
        });
        const httpcode = response.status;
        const respText = await response.text();

        let respJson;
        try {
            respJson = JSON.parse(respText);
            respJson.copyright = '@LUTIFY';
            return res.status(httpcode).json(respJson);
        } catch (parseErr) {
            // Fallback kalau response bukan JSON valid
            console.error('Gagal parse JSON dari API target:', parseErr);
            console.error('Respon mentah dari API target:', respText);
            return res.status(httpcode).json({
                status: 'error',
                message: 'API target error / bukan JSON',
                copyright: '@LUTIFY'
            });
        }
    } catch (err) {
        // Logging error ke terminal
        console.error('ERROR request ke API target:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi error pada server',
            copyright: '@LUTIFY'
        });
    }
});

// Jalankan server pada port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Coba akses: http://localhost:3000/your-endpoint?username=ISI&domain=ISI&password=ISI&paket=1');
});
