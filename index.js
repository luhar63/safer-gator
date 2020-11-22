const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
var cors = require('cors');
var history = require('connect-history-api-fallback');

const app = express();
app.use(cors());
// app.use(history());

const mainroutes = require('./routes/index');

dotenv.config();

// mongoose.connect(process.env.DB_CONNECTION_STR, {
//     useNewUrlParser: true
// }).then(() => {
//     return app.listen(3000, () => {
//         console.log('Server is up and running');
//     });
// }).catch(error => console.error(error));
app.listen(3000, () => {
    console.log('Server is up and running');
});

app.use(express.static(__dirname + "/views")); // html
app.use(express.static(__dirname + "/public")); // js, css, images

app.use(express.json())
app.use('/api', mainroutes);