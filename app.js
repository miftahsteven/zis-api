const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const path = require("path");
const cors = require('cors');


app.use(bodyParser.urlencoded({ extended: true, limit: '100mb', parameterLimit: 50000 }))
app.use(bodyParser.json({limit: '50mb', extended: true}))
//app.use(express.raw({ type: '*/*', limit: '50mb' }));

const appRoute = require('./app/routes/route-auth');
const homeRoute = require('./app/routes/route-home');
const mustahiqRoute = require('./app/routes/route-mustahiq');
const transRoute = require('./app/routes/route-transaction');

app.use("/public/uploads", express.static(path.join(__dirname, "uploads/docs")));
app.use("/public/banners", express.static(path.join(__dirname, "uploads/banners")));

app.use(cors({
    origin: ['https://portal.zisindosat.id','http://localhost:3001']
}));
app.use('/auth', appRoute);
app.use('/home', homeRoute);
app.use('/mustahiq', mustahiqRoute);
app.use('/transaction', transRoute);

app.get('/', (req, res) => {
        res.send('Selamat Datang Di Portal ZISWAF Indosat');
});

app.listen(3034, ()=>{
    console.log('Server Berjalan di Port : 4800');
});