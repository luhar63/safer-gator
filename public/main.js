var LATS;
var LONGS;
var INFOBOX;
var MATRIX;
var PINS;
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

function nearestSafeZone(x, y, type = 'zone') {
    var k = 0;
    var safePlaces = [];
    while (true && k < 5) {
        for (var i = x - k; i <= x + k; i++) {
            for (var j = y - k; j <= y + k; j++) {
                if (i == x - k || i == x + k || j == y - k || j == y + k) {
                    if (i >= 0 && j >= 0 && i <= NUM_ROWS && j <= NUM_COLS && MATRIX[i] && MATRIX[i][j]) {
                        if (type === 'blp') {
                            if (MATRIX[i][j].blp_count > 0) {
                                safePlaces = safePlaces.concat(MATRIX[i][j].blp);
                            }
                        }
                        else if (type === 'bus') {
                            if (MATRIX[i][j].bus_stops_count > 0) {

                                safePlaces = safePlaces.concat(MATRIX[i][j].bus_stops);
                            }
                        }
                        else if (type === 'snap') {
                            if (MATRIX[i][j].snap_count > 0) {
                                safePlaces = safePlaces.concat(MATRIX[i][j].snap);
                            }
                        }
                        else if (MATRIX[i][j].safety_index < -5) {
                            safePlaces.push(MATRIX[i][j]);
                        }
                    }
                }
            }
        }
        if (safePlaces.length > 0 && type == 'zone') {
            break;
        }
        k++;
    }
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
    console.log("number of safezones:", safeZones.length);
    var minDistance = await caluculateDictanceBetweenLocations(startLocation, new Microsoft.Maps.Location(safeZoneCenter[0], safeZoneCenter[1]));
    console.log("safezone :", 0, safeZoneCenter, minDistance);
    for (var i = 1; i < safeZones.length; i++) {
        var center = safeZones[i].zone_center;
        var distance = await caluculateDictanceBetweenLocations(startLocation, new Microsoft.Maps.Location(center[0], center[1]));
        if (distance < minDistance) {
            minDistance = distance;
            safeZoneCenter = center;
        }
        console.log("safezone :", i, center, distance);
    }
    return new Promise((resolve, reject) => {
        resolve(new Microsoft.Maps.Location(safeZoneCenter[0], safeZoneCenter[1]));
    }
    );

}


async function simulateGPSWithClick(type) {
    clearInfobox();
    map = window.mapInstance;
    const location = window.gpsLoc;
    const { x, y } = getGPSZone(location.latitude, location.longitude);
    var safeZones = nearestSafeZone(x, y);
    let centerLocation = await getClosestSafeCenterLocation(location, safeZones);

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
        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel'), firstWaypointPushpinOptions: { subTitle: 'You' }, lastWaypointPushpinOptions: { subTitle: 'Destination' } });
        console.log(directionsManager);
        directionsManager.calculateDirections();
    });
}

function clearInfobox() {
    if (INFOBOX != null) {
        INFOBOX.setMap(null);
    }
}

function clearPushpins() {
    map = window.mapInstance;
    for (var i = map.entities.getLength() - 1; i >= 0; i--) {
        var pushpin = map.entities.get(i);
        if (pushpin instanceof Microsoft.Maps.Pushpin) {
            map.entities.removeAt(i);
        }
    }
}
function simulateBlpSearchClick(type) {
    clearInfobox();
    map = window.mapInstance;
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        const location = window.gpsLoc;
        const { x, y } = getGPSZone(location.latitude, location.longitude);
        var blpLocations = nearestSafeZone(x, y, type);
        clearPushpins();
        blpLocations.forEach((blpLoc) => {
            // console.log('blp', blpLoc[0], blpLoc[1]);
            var loc = new Microsoft.Maps.Location(blpLoc[0], blpLoc[1]);
            var blpPin = new Microsoft.Maps.Pushpin(loc, { visible: true });
            map.entities.push(blpPin);

            Microsoft.Maps.Events.addHandler(blpPin, 'click', function (e) {
                // console.log('pushpin clicked');

                navigator.geolocation.getCurrentPosition(function (pos) {

                    var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
                    // Set Route Mode to walking
                    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
                    var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ location: e.location });
                    var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ location: new Microsoft.Maps.Location(pos.coords.latitude, pos.coords.longitude) });
                    directionsManager.addWaypoint(waypoint1);
                    directionsManager.addWaypoint(waypoint2);
                    // Set the element in which the itinerary will be rendered
                    directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel'), firstWaypointPushpinOptions: { subTitle: 'You' }, lastWaypointPushpinOptions: { subTitle: 'Destination' } });
                    // console.log(directionsManager);
                    directionsManager.calculateDirections();
                });

            });


        });

    })
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
        Microsoft.Maps.Events.addHandler(polygon, 'click', function (e) {
            console.log('polygon clicked');
            console.log('location:', e.location.latitude, e.location.longitude);
            if (INFOBOX != null) {
                INFOBOX.setMap(null);
            }
            INFOBOX = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(zone.zone_center[0], zone.zone_center[1]), {
                title: 'Zone Info',
                showCloseButton: true,
                description: `Crimes: ${zone.crimes} 
                    \n BluePhone: ${zone.blp_count > 0 ? 'Yes' : 'No'}
                    \n SNAP stop: ${zone.snap_count > 0 ? 'Yes' : 'No'}`,
                maxWidth: 150

            });
            INFOBOX.setMap(map);
            // map.entities.push(infobox);

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

function createOverlay() {
    PanningOverlay.prototype = new Microsoft.Maps.CustomOverlay({ beneathLabels: false });

    //Define a constructor for the custom overlay class.
    function PanningOverlay() {
        this.ifSafe = document.createElement('button');
        this.ifSafe.innerHTML = `<i class="fas fa-exclamation"></i>`;
        this.ifSafe.classList.add('round-btn')
        this.ifSafe.classList.add("tooltip");
        this.ifSafe.setAttribute("data-toggle", "tooltip");
        this.ifSafe.setAttribute("data-placement", "top");
        this.ifSafe.setAttribute("title", "Am I safe?");
        this.ifSafe.onclick = function () {
            var { x, y } = getGPSZone(window.gpsLoc.latitude, window.gpsLoc.longitude);
            var zone = MATRIX[x][y];
            if (INFOBOX != null) {
                INFOBOX.setMap(null);
            }
            INFOBOX = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(zone.zone_center[0], zone.zone_center[1]), {
                title: 'Zone Info',
                showCloseButton: true,
                description: `Crimes: ${zone.crimes} 
                    \n BluePhone: ${zone.blp_count > 0 ? 'Yes' : 'No'}
                    \n SNAP stop: ${zone.snap_count > 0 ? 'Yes' : 'No'}`,
                maxWidth: 150

            });
            INFOBOX.setMap(window.mapInstance);

        };

        this.navigate = document.createElement('button');
        this.navigate.innerHTML = `<i class="fas fa-location-arrow"></i>`;
        this.navigate.classList.add('round-btn');
        this.navigate.classList.add("tooltip");
        var nav = document.getElementsByClassName("menu")[0];
        this.navigate.appendChild(nav);
        this.navigate.setAttribute("data-toggle", "tooltip");
        this.navigate.setAttribute("data-placement", "top");


        this.drawer = document.createElement('button');
        this.drawer.innerHTML = `<i class="fas fa-align-justify"></i>`;
        this.drawer.classList.add('round-btn');
        this.drawer.setAttribute("title", "navigation panel");
        // this.navigate.setAttribute("title", "Take me to a safer place");
        this.drawer.onclick = function () {
            openNav();
            clearInfobox();
        };

        // this.gotoAccessPoint = document.createElement('button');
        // this.gotoAccessPoint.innerHTML = `<i class="fas fa-user-shield"></i><span class="tooltiptext">Take me to a safety access point</span>`;
        // this.gotoAccessPoint.classList.add('round-btn');
        // this.gotoAccessPoint.classList.add("tooltip");
        // this.gotoAccessPoint.onclick = function () {
        //     panMap('left');
        // };
    }

    //Implement the onAdd method to set up DOM elements, and use setHtmlElement to bind it with the overlay.
    PanningOverlay.prototype.onAdd = function () {
        //Create a div that will hold pan buttons.
        var container = document.createElement('div');
        container.appendChild(this.drawer);
        container.appendChild(this.ifSafe);
        container.appendChild(this.navigate);
        // container.appendChild(this.gotoAccessPoint);
        container.style.position = 'absolute';
        container.style.top = '50vh';
        container.style.left = '10px';
        this.setHtmlElement(container);
    };

    //Implement the new custom overlay class.
    return new PanningOverlay();
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

var mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
function openNav() {
    var size = "50%";
    if (mobileCheck()) {
        size = "100%";
    }
    document.getElementById("sidenav").style.width = size; //opens side navbar by 70 percent
    document.getElementById('backdrop').style.display = "block" //displays overlay
}

function closeNav() {
    document.getElementById("sidenav").style.width = "0"
    document.getElementById('backdrop').style.display = "none"
}
