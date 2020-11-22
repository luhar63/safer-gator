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
