var LATS;
var LONGS;

var MATRIX;
function binarySearch(arr, x) {
    x = parseFloat(x);
    let start = 0, end = arr.length - 1;
    let mid;
    // Iterate while start not meets end 
    // debugger;
    while (start < end) {

        // Find the mid index 
        mid = Math.floor((start + end) / 2);
        var check = Math.abs(arr[mid]);
        if (check > Math.abs(x))
            start = mid + 1;
        else
            end = mid;
    }

    return start;
}


function getGPSZone(lat, long) {
    // console.log(lat, long);
    var x = binarySearch(LATS, lat) - 1;
    var y = binarySearch(LONGS, long) - 1;
    return { x, y };
}

function nearestSafeZone(x, y, blp = false) {
    var k = 0;
    var safePlaces = [];
    while (true) {
        for (var i = x - k; i <= x + k; i++) {
            for (var j = y - k; j <= y + k; j++) {
                if (i == x - k || i == x + k || j == y - k || j == y + k) {
                    if (i <= NUM_ROWS && j <= NUM_COLS && MATRIX[i][j]){
                        if (blp) {
                             if (MATRIX[i][j].blp.length > 0){
                                safePlaces = safePlaces.concat(MATRIX[i][j].blp);
                             }
                        }
                        else if (MATRIX[i][j].safety_index < -5){
                            safePlaces.push(MATRIX[i][j]);
                        }
                    }
                }
            }
        }
        if (safePlaces.length > 0) {
            break;
        }
        k++;
    }
    console.log(k);
    console.log(safePlaces);
    return safePlaces;
}

function getData(url, headers) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            mode: "cors",
            header: headers,
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                console.log("Error: \n");
                reject(error);
            });
    });
}

function postData(url, headers, data = {}) {
    return new Promise((resolve, reject) => {
        // console.log(JSON.stringify(data));
        fetch(url, {
            mode: "cors",
            header: headers,
            method: "POST",
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                console.log("Error: \n");
                console.log(error);
                reject(error);
            });
    });
}

function createPolygon(points, map) {
    var polyData = [];
    points.forEach((point) => {
        const [long, lat] = point;
        polyData.push(new Microsoft.Maps.Location(lat, long));
    });
    var polygon = new Microsoft.Maps.Polygon(polyData);
    polygon.setOptions({
        fillColor: "#96ef942b",
    });
    map.entities.push(polygon);
}

function createCirclePushpin(
    location,
    radius,
    fillColor,
    strokeColor,
    strokeWidth
) {
    if (strokeColor === void 0) {
        strokeColor = "";
    }
    if (strokeWidth === void 0) {
        strokeWidth = 0;
    }
    //Create an SVG string of a circle with the specified radius and color.
    var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        2 * radius +
        '" height="' +
        2 * radius +
        '">\n        <circle cx="' +
        radius +
        '" cy="' +
        radius +
        '" r="' +
        (radius - strokeWidth) +
        '" stroke="' +
        strokeColor +
        '" stroke-width="' +
        strokeWidth +
        '" fill="' +
        fillColor +
        '"/></svg>';
    //Create a pushpin from the SVG and anchor it to the center of the circle.
    return new Microsoft.Maps.Pushpin(location, {
        icon: svg,
        anchor: new Microsoft.Maps.Point(radius, radius),
    });
}
async function getBLP(map) {
    let response = await getData("http://localhost:3000/api/blp", {
        "Content-Type": "application/json",
    });
    response = response.features;
    response.forEach((item) => {
        // if (building.geometry.type === "Polygon") {
        //   building.geometry.coordinates.forEach((coordinates) => {
        //     createPolygon(coordinates, map);
        //   });
        // }
        const [long, lat] = item.geometry.coordinates;
        const boundsBorder = createCirclePushpin(
            new Microsoft.Maps.Location(lat, long),
            3,
            "rgba(0, 0, 255, 0.5)"
        );
        map.entities.push(boundsBorder);
    });
}
async function getSearch(map) {
    let response = await getData("http://localhost:3000/api/search", {
        "Content-Type": "application/json",
    });
    response.forEach((item) => {
        // if (building.geometry.type === "Polygon") {
        //   building.geometry.coordinates.forEach((coordinates) => {
        //     createPolygon(coordinates, map);
        //   });
        // }
        if (item.JTYPE == "BLDG" && item.LAT && item.LON) {
            const boundsBorder = createCirclePushpin(
                new Microsoft.Maps.Location(item.LAT, item.LON),
                3,
                "rgba(180, 73, 199, 0.4)"
            );
            map.entities.push(boundsBorder);
        }
    });
}

async function getBusStops(map) {
    let response = await getData("http://localhost:3000/api/bus_stops", {
        "Content-Type": "application/json",
    });
    response = response.features;
    response.forEach((item) => {
        // if (building.geometry.type === "Polygon") {
        //   building.geometry.coordinates.forEach((coordinates) => {
        //     createPolygon(coordinates, map);
        //   });
        // }
        const [long, lat] = item.geometry.coordinates;
        const boundsBorder = createCirclePushpin(
            new Microsoft.Maps.Location(lat, long),
            3,
            "rgba(0, 0, 0, 0.5)"
        );
        map.entities.push(boundsBorder);
    });
}
async function getCrimes(map) {
    let response = await getData("http://localhost:3000/api/crimes", {
        "Content-Type": "application/json",
    });
    // response = response.features;
    response.forEach((item) => {
        // if (building.geometry.type === "Polygon") {
        //   building.geometry.coordinates.forEach((coordinates) => {
        //     createPolygon(coordinates, map);
        //   });
        // }
        const [lat, long] = item;
        if (
            lat >= 29.528179 &&
            lat <= 29.752244 &&
            long >= -82.372585 &&
            long <= -82.339005
        ) {
            const boundsBorder = createCirclePushpin(
                new Microsoft.Maps.Location(lat, long),
                3,
                "rgba(226, 24, 24, 0.6)"
            );
            map.entities.push(boundsBorder);
        }
    });
}



// init();
async function getZone(map) {
    const myHeaders = new Headers();
    let response = await getData("http://localhost:3000/api/bounds", {
        "Content-Type": "application/json",
    });
    var latitude = new Set();
    var longitude = new Set();
    NUM_COLS = response.meta.cols;
    NUM_ROWS = response.meta.rows;
    var i = 0, j = 0;
    MATRIX = response.zone_matrix;
    response.zone_matrix.forEach((row) => {
        j = 0;
        row.forEach((zone) => {
            if (i === 0) {
                longitude.add(zone.northwest_lon);
                longitude.add(zone.southeast_lon);
            }
            if (j === 0) {
                latitude.add(zone.northwest_lat);
                latitude.add(zone.southeast_lat);
            }
            createZone(map, zone);
            j++;
        })
        i++;
    });
    LATS = [...latitude];
    LONGS = [...longitude];
}

async function caluculateDictanceBetweenLocations(locationA, locationB) {
    let url = new URL('http://dev.virtualearth.net/REST/V1/Routes/Walking')
    url.search = new URLSearchParams({
        "waypoint.1": `${locationA.latitude},${locationA.longitude}`,
        "waypoint.2": `${locationB.latitude},${locationB.longitude}`,
        "output": "json",
        "key": "AluujRQBFSr8aENSYJ9h4vR9yxCrOjUk5e-1mHGv5EXBMf4F7R_xkIpvmSmyghRg"
    });

    let response = await getData(url, {
        "Content-Type": "application/json",
    });
    return new Promise((resolve, reject) => {
        if (response.resourceSets.length > 0) {
            var total = response.resourceSets[0].estimatedTotal;
            var res = response.resourceSets[0].resources[0];
            resolve(res.travelDistance);
        }
        else {
            reject(99);
        }
    });
}

async function getClosestSafeCenterLocation(startLocation, safeZones) {

    var safeZoneCenter = safeZones[0].zone_center;
    var minDistance = await caluculateDictanceBetweenLocations(startLocation, new Microsoft.Maps.Location(safeZoneCenter[0], safeZoneCenter[1]));
    for (var i = 1; i < safeZones.length; i++) {
        var center = safeZones[i].zone_center;
        var distance = await caluculateDictanceBetweenLocations(startLocation, new Microsoft.Maps.Location(center[0], center[1]));
        if (distance < minDistance) {
            minDistance = distance;
            safeZoneCenter = center;
        }
    }
    return new Promise((resolve, reject) => {
        resolve(new Microsoft.Maps.Location(safeZoneCenter[0], safeZoneCenter[1]));
    }
    );

}

function simulateGPSWithClick(map) {
    Microsoft.Maps.Events.addHandler(map, "click", async function (e) {
        const location = e.location;
        const { x, y } = getGPSZone(location.latitude, location.longitude);
        var safeZones = nearestSafeZone(x, y);
        let centerLocation = await getClosestSafeCenterLocation(e.location, safeZones);
        // (async () => {

        //     centerLocation = 

        // })();

        // var centers = safeZone.zone_center;
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
            var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
            // Set Route Mode to walking
            directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
            var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ location: location });
            var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ location: centerLocation });
            directionsManager.addWaypoint(waypoint1);
            directionsManager.addWaypoint(waypoint2);
            // Set the element in which the itinerary will be rendered
            directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel'), firstWaypointPushpinOptions: { text: "You" } });
            console.log(directionsManager);
            directionsManager.calculateDirections();
        });
        // StartTracking(map);


        // console.log(x, y);
    });
}

function simulateBlpSearchClick(map) {
    Microsoft.Maps.Events.addHandler(map, "click", async function (e) {
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        const location = e.location;
        const { x, y } = getGPSZone(location.latitude, location.longitude);
        var blpLocations = nearestSafeZone(x, y, true);
        
        blpLocations.forEach((blpLoc) => {
            console.log('blp', blpLoc[0], blpLoc[1]);
            var loc = new Microsoft.Maps.Location(blpLoc[0], blpLoc[1]);
            console.log(loc)
            var blpPin = new Microsoft.Maps.Pushpin(loc, { visible: true });
            map.entities.push(blpPin);

            Microsoft.Maps.Events.addHandler(blpPin, 'click', function (e) 
            { 
                console.log('pushpin clicked'); 
                
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        
                        var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
                        // Set Route Mode to walking
                        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
                        var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ location: e.location });
                        var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ location: new Microsoft.Maps.Location(pos.coords.latitude, pos.coords.longitude) });
                        directionsManager.addWaypoint(waypoint1);
                        directionsManager.addWaypoint(waypoint2);
                        // Set the element in which the itinerary will be rendered
                        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel'), firstWaypointPushpinOptions: { text: "You" } });
                        console.log(directionsManager);
                        directionsManager.calculateDirections();
                    });
                    
                });
                

            });
            
        })
    });
}

function createZone(map, zone) {
    // console.log(zone.northwest_lat, zone.northwest_lon);
    // console.log(
    //   new Microsoft.Maps.Location(zone.northwest_lat, zone.northwest_lon)
    // );
    var bounds = Microsoft.Maps.LocationRect.fromLocations([
        new Microsoft.Maps.Location(zone.northwest_lat, zone.northwest_lon),
        new Microsoft.Maps.Location(zone.southeast_lat, zone.southeast_lon),
    ]);
    Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function () {
        var polygon = Microsoft.Maps.SpatialMath.locationRectToPolygon(
            bounds
        );
        polygon.setOptions({
            strokeColor: "transparent",
            fillColor:
                zone.safety_index === -5
                    ? "rgb(128,128,128, 0.25)"
                    : getLegendColor(zone.safety_index, 18),
        });
        // console.log(polygon);
        map.entities.push(polygon);
        Microsoft.Maps.Events.addHandler(polygon, 'click', function (e) 
            { 
                console.log('polygon clicked'); 
                var infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(zone.zone_center[0], zone.zone_center[1]), {
                    title: 'Zone Info',
                    showCloseButton: true,
                    description: `Crimes: ${zone.crimes} 
                    \n BluePhone: ${zone.blp_count>0? 'Yes': 'No'}
                    \n SNAP stop: ${zone.snap_count>0? 'Yes': 'No'}`,
                    maxWidth: 150

                });
                map.entities.push(infobox);
                
            });
    });
    // console.log(boundsCoordinates);

    // boundsCoordinates = [bounds.getNorthwest().latitude, bounds.getNorthwest().longitude, bounds.getSoutheast().latitude, bounds.getSoutheast().longitude];
    // return boundsCoordinates;
}

async function saveCoordinates(boundsCoordinatesList) {
    let response = await postData(
        "http://localhost:3000/api/save",
        {
            "Content-Type": "application/json",
        },
        { boundsCoordinatesList: boundsCoordinatesList }
    );
    console.log(response);
}


function StartTracking(map) {
    //Add a pushpin to show the user's location.
    userPin = new Microsoft.Maps.Pushpin(map.getCenter(), { visible: false });
    map.entities.push(userPin);

    //Watch the users location.
    watchId = navigator.geolocation.watchPosition(UsersLocationUpdated.bind(this, map));
}

function UsersLocationUpdated(map, position) {
    var loc = new Microsoft.Maps.Location(
        position.coords.latitude,
        position.coords.longitude);

    //Update the user pushpin.
    userPin.setLocation(loc);
    userPin.setOptions({ visible: true });

    //Center the map on the user's location.
    map.setView({ center: loc });
}

function StopTracking() {
    // Cancel the geolocation updates.
    navigator.geolocation.clearWatch(watchId);

    //Remove the user pushpin.
    map.entities.clear();
}