const express = require('express');
const path = require('path');
const app = express();
const https = require('https');
const fs = require('fs');
const axios = require('axios');
const spdy = require('spdy');
const PUBLIC_PATH = 'public';

app.use(express.static(PUBLIC_PATH));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pdf/:filename', (req, res) => {
    let filename = req.params.filename;
    let file = path.join(PUBLIC_PATH, filename);
    res.set('Content-Type', 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
});

app.get('/posts', (req, res) => {
    axios.get('https://jsonplaceholder.typicode.com/posts', {
        method: 'GET'
    })
        .then(function(response) {
            res.send(response.data);
        }, function(err) {
            res.send(err);
        });
});

app.get('/send', (req, res) => {
    axios.post('https://android.googleapis.com/gcm/send', {
        "registration_ids": ["dk8OUwjHC1E:APA91bHGzSUrTHQr22UMlj322CC7z6CDmXsc-dd8I0TBZKPmOVXZU5A5gudE08OiW2u4WjAjyve-PGeBGlwOneW3wOH7Z08SCuqj0xGVeQnjjUjBGs8s-iJjBR19zEtYKp8rDOU2zK-Q"]
    }, {
        headers: {
            'Authorization': 'key=AIzaSyBH6IxcOKemWLpqEim2RtrhhCbhDqnhlFo',
            'Content-Type': 'application/json'
        }
    })
        .then((response) => {
            res.send(response.data);
        }, (err) => {
            res.send(err);
        });
});

const privateKey = fs.readFileSync('./key.pem').toString();
const certificate = fs.readFileSync('./cert.pem').toString();
const options = {
    key: privateKey,
    cert: certificate,
    passphrase: 'lola',
    protocols: [ 'h2']
};
spdy
    .createServer(options, app)
    .listen(3000, (error) => {
        if (error) {
            console.error(error);
            return process.exit(1);
        } else {
            console.log('Listening on port: ' + 3000 + '.');
        }
    });