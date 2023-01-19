const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname+ '/frontend/index.html');
    })
app.get('/register', (req, res) => {
    res.sendFile(__dirname+ '/frontend/register.html');
    })

app.get('/login', (req, res) => {
    res.sendFile(__dirname+ '/frontend/login.html');
    })    

app.listen(3000, () => console.log('running at 3000...'));