const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.sendFile(__dirname+ '/frontend/index.html');
    })
app.post('/register', (req, res) => {
    res.sendFile(__dirname+ '/frontend/register.html');
    })

app.get('/login', (req, res) => {
    res.sendFile(__dirname+ '/frontend/login.html');
    })    

app.listen(3000, () => console.log('running at 3000...'));