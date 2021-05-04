"use strict"
/**
 * This file contains js for the savedTrips.html page.
 * Author: ENG1003 Team 44
 * Last Modified: 1/11/20
 */


// gives todays date 
let today = new Date().toJSON().slice(0, 10);
let layerIdIndex = 0;
let savedTripsArray = [];


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZW5nMTAwM3RlYW0wNDQiLCJhIjoiY2tldDlsNDl4MWN4aTJxdDh1aHZ2aWIxNiJ9.pTk-jc23gIBfzI0Cw8V-3A';
let savedTripsMap = "";

// cancelTrip()
// Purpose: this function runs when the 'cancel' button on the table is clicked, it will delete the selected tirp form the tripList and removed the specfic row from the table 
// Argument: None
// Return: Does not return anything 
function cancelTrip() {
    let cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to cancel selected trip(s)?')) {
            let userIndex = localStorage.getItem(USER_INDEX_KEY);
            let user = userList.users[userIndex];

            let selectedRowsRef = document.getElementsByClassName('is-selected');
            for (let i in selectedRowsRef) {
                if (typeof (selectedRowsRef[i]) == 'object') {
                    let tripIndex = selectedRowsRef[i].getAttribute("id");
                    for (let j in user.tripList) {
                        if (user.tripList[j].index == tripIndex) {
                            userList.users[userIndex].cancelTrip(user.tripList[j]); // calls the 'cancelTrip' method, which will remove the trip from the tripList
                            updateLocalStorage(userList, USER_DATA_KEY);
                        }
                    }
                }
            }
            window.location = 'savedTrips.html'; // redirects user to the savedTrips page, so will reload the page 
        }
    })
}

// displaySavedTripsMap()
//
// Purpose: The function displays a map on the saved trips page.
// Argument: None
// Return: Does not return anything
function displaySavedTripsMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    savedTripsMap = new mapboxgl.Map({
        container: 'tripsMap',
        center: [0, 0],
        zoom: 0,
        style: 'mapbox://styles/mapbox/streets-v9'
    });
}

// displaySavedTripsTable
// Purpose: The function is responsible for adding a new row to the saved trips table, which will contain the trip index, date, source airport and destination airport
// Argument: None
// Return: Does not return anything
// add rows to the main table
function displaySavedTripsTable() {
    let userIndex = localStorage.getItem(USER_INDEX_KEY);
    let user = userList.users[userIndex];
    if (user.logInStatus) {
        let trips = user.tripList;
        for (let i = 0; i < trips.length; i++) {
            let output = "";
            let tableRef = document.getElementById('tripsTableArea');

            if (today <= trips[i].date) {
                savedTripsArray.push(trips[i]);
                output = `<tr id='${trips[i].index}'>
                            <td class="Index" class="mdl-data-table__cell--non-numeric">${trips[i].index}</td>
                            <td class="Date" class="mdl-data-table__cell--non-numeric">${trips[i].date}</td>
                            <td class="From" class="mdl-data-table__cell--non-numeric" class="From">${trips[i]._initialRoute._sourceAirport._airportCode}</td>
                            <td class="To" class="mdl-data-table__cell--non-numeric">${trips[i]._finalRoute._destinationAirport._airportCode}</td>
                        </tr>`
                tableRef.innerHTML += output;
            }
        }
        addRowEventListeners(savedTripsArray);
    }
    cancelTrip(); // cancelTrip() funciton called 
}

// displayTripDetailsRow(trip)
// Purpose: Displays extra information (trip index, stops, connecting flights, plane type and airline) for a trip when a specifc row is selected 
// Argument - trip: 'trip' object which contains information for the specific trip selected from the row 
// Return: Does not return anything
function displayTripDetailsRow(trip) {
    let indexRef = document.getElementById("Index");
    let numberOfStopsRef = document.getElementById("stops");
    let connectingFlightsRef = document.getElementById("connectingFlights");
    let planeTypeRef = document.getElementById("planeType");
    let airlineRef = document.getElementById("airline");

    indexRef.innerText = trip.index;
    numberOfStopsRef.innerText = trip.stops.length;
    let stops = '';
    for (let i in trip.stops) {
        let destAirport = trip.stops[i]._destinationAirport;
        let srcAirport = trip.stops[i]._sourceAirport;
        if (srcAirport != undefined) {
            stops += trip.stops[i]._sourceAirport._airportCode + ', ';
        }
        else if (destAirport != undefined) {
            stops += trip.stops[i]._destinationAirport._airportCode + ', ';
        }
        else {
            throw 'Something wrong...';
        }
    }
    connectingFlightsRef.innerText = stops.slice(0, stops.length - 2);
    planeTypeRef.innerText = trip._initialRoute._planeType;
    airlineRef.innerText = trip._initialRoute._airline;
}

// getGeocodingAPIDataSavedTrips(trip)
// Purpose: Gets the location of country of the trip in order for map to pan to the right place 
// Argument - trip: 'trip' object which contains information for the specific trip selected from the row 
// Return: Does not return anything
function getGeocodingAPIDataSavedTrips(trip) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${trip._country}.json/?access_token=${MAPBOX_ACCESS_TOKEN}`)
        .then(response => response.json())
        .then(data => panToCountrySavedTrips(data));
}

// panToCountrySavedTrips(data) 
// Purpose: take location data from the 'getGeocodingAPIDataSavedTrips(trip)', and pans the map to the country of the trip booked 
// Argument - data: contains country location of the trip and changes the bounds of the map so that it displays only the country of the booked trip (pans the map to right location)
// Return: Does not return anything
function panToCountrySavedTrips(data) {
    let bounds = data.features[0].bbox;
    savedTripsMap.fitBounds(bounds);
}

// displaySavedTripRoutes(trip)
// Purpose: displays the trip icons and routes in the map once a specfic trip is selected 
// Argument - trip: 'trip' object which contains information for the specific trip selected from the row 
// Return: Does not return anything
function displayRouteSavedTrips(trip) {

    // Initial Route:
    let locations = [
        {
            coordinates: [trip._initialRoute._sourceAirport._longitude, trip._initialRoute._sourceAirport._latitude],
            description: `City: ${trip._initialRoute._sourceAirport._city}<br>Airport: ${trip._initialRoute._sourceAirport._airportCode}`
        }
    ];

    // Stops:
    for (let i = 0; i < trip._stops.length; i++) {
        locations.push({
            coordinates: [trip._stops[i]._destinationAirport._longitude, trip._stops[i]._destinationAirport._latitude],
            description: `City: ${trip._stops[i]._destinationAirport._city}<br>Airport: ${trip._stops[i]._destinationAirport._airportCode}`
        })

    }
    // Final Route:
    locations.push({
        coordinates: [trip._finalRoute._destinationAirport._longitude, trip._finalRoute._destinationAirport._latitude],
        description: `City: ${trip._finalRoute._destinationAirport._city}<br>Airport: ${trip._finalRoute._destinationAirport._airportCode}`
    })

    let coords = [];
    for (let i in locations) {
        coords.push(locations[i].coordinates);
    }


    let sourceObject = {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': coords
            }
        }
    };
    savedTripsMap.addLayer({
        'id': 'L' + layerIdIndex,
        'type': 'line',
        'source': sourceObject,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#888',
            'line-width': 5
        }
    });
    layerIdIndex++;

    for (let i = 0; i < locations.length; i++) {
        let location = locations[i];
        let marker = new mapboxgl.Marker({ "color": "#FF8C00" });
        marker.setLngLat(location.coordinates);

        let popup = new mapboxgl.Popup({ offset: 45 });
        //popup.setText(location.description);
        popup.setHTML(location.description)
        marker.setPopup(popup)

        // Display the popup.
        popup.addTo(savedTripsMap);

        // Display the marker.
        marker.addTo(savedTripsMap);

        marker.getElement().addEventListener('mouseenter', function () { marker.togglePopup() });
        marker.getElement().addEventListener('mouseleave', function () { marker.togglePopup() });
    }
}

// addRowEventListeners(trips)
// Purpose: adds event listeners to the table rows so when the row is clicked, it calls the functions displayTripDetailsRow(trips), getGeocodingAPIDataPastTrips(trips), displayPastTripRoutes(trips);
// Argument - trip: an object that contains all the information for that particular trip 
// Return: Does not return anything
function addRowEventListeners(trips) {
    for (let i in trips) {
        let tripRef = document.getElementById(trips[i].index);
        tripRef.addEventListener('click', function () {
            displayTripDetailsRow(trips[i]);
            getGeocodingAPIDataSavedTrips(trips[i]);
            displayRouteSavedTrips(trips[i]);
        });
    }
}

// On Page Load:
displaySavedTripsMap();
displaySavedTripsTable();
