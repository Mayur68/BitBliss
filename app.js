const express = require('express');
const app = express();
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html');
})

app.get('/sign-up', (req, res) => {
    res.sendFile(__dirname + '/frontend/sign-up.html');
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/frontend/login.html');
})

app.get('/loby.html', (req, res) => {
    res.sendFile(__dirname + '/frontend/loby.html');
    res.json({
        username
    });
})

app.listen(3000, () => console.log('running at 3000...'));