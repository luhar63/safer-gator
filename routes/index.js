const router = require('express').Router();
const fs = require('fs');
const path = require('path');

router.get('/zone', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/zone.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        let building = JSON.parse(data);
        res.send(building);
    });


});


router.get('/blp', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/blp.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        let blp = JSON.parse(data);
        res.send(blp);
    });


});

router.post('/save', async (req, res) => {
    console.log('In save');
    console.log(req.body);
    // res.send('Done');
});

router.get('/search', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/search.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        let search = JSON.parse(data);
        res.send(search);
    });


});

router.get('/bus_stops', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/bus_stops.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        let search = JSON.parse(data);
        res.send(search);
    });


});
router.get('/buildings', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/geo_buildings.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        let building = JSON.parse(data);
        res.send(building);
    });


});
router.get('/crimes', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/crimes_locations.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        let building = JSON.parse(data);
        res.send(building);
    });


});

router.get('/bounds', async (req, res) => {

    fs.readFile(path.resolve(__dirname, "../json/bounds_crimes.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        let bounds = JSON.parse(data);
        res.send(bounds);
    });


});

router.get('/polygons', async (req, res) => {

    // let rawdata = fs.readFileSync('./json/search.json');

    // let search = JSON.parse(rawdata);
    fs.readFile(path.resolve(__dirname, "../json/polygons_old.json"), function (err, data) {

        // Check for errors 
        if (err) throw err;

        // Converting to JSON 
        // let building = ;
        res.send(JSON.parse(data));
    });


});

module.exports = router;
