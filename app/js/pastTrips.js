"use strict"
/**
 * This file contains js for the pastTrips.html page.
 * Author: ENG1003 Team 44
 * Last Modified: 1/11/20
 */


// gives todays date 
let today = new Date().toJSON().slice(0, 10);
let layerIdIndex = 0;
let pastTripsArray = [];

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZW5nMTAwM3RlYW0wNDQiLCJhIjoiY2tldDlsNDl4MWN4aTJxdDh1aHZ2aWIxNiJ9.pTk-jc23gIBfzI0Cw8V-3A';
let pastTripsMap = "";

// displayPastTripsMap()
// Purpose: The function displays a map on the past trips page.
// Argument: None
// Return: Does not return anything
function displayPastTripsMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    pastTripsMap = new mapboxgl.Map({
        container: 'tripsMap',
        center: [0, 0],
        zoom: 0,
        style: 'mapbox://styles/mapbox/streets-v9'
    });
}

// displayPastTripsTable
// Purpose: The function is responsible for adding a new row to the past trips table, which will contain the trip index, date, source airport and destination airport
// Argument: None
// Return: Does not return anything
// add rows to the main table
function displayPastTripsTable() {
    let userIndex = localStorage.getItem(USER_INDEX_KEY);
    let user = userList.users[userIndex];
    if (user.logInStatus) {
        let trips = user.tripList;
        for (let i = 0; i < trips.length; i++) {
            let output = "";
            let tableRef = document.getElementById('tripsTableAreaPast');

            if (today >= trips[i].date) { // checks if trip is a past trip by comparing its date with the current date 
                pastTripsArray.push(trips[i]); // adds all the part trips to the pastTripsArray
                output = `<tr id='${trips[i].index}'>
                            <td class="Index" class="mdl-data-table__cell--non-numeric">${trips[i].index}</td>
                            <td class="Date" class="mdl-data-table__cell--non-numeric">${trips[i].date}</td>
                            <td class="From" class="mdl-data-table__cell--non-numeric" class="From">${trips[i]._initialRoute._sourceAirport._airportCode}</td>
                            <td class="To" class="mdl-data-table__cell--non-numeric">${trips[i]._finalRoute._destinationAirport._airportCode}</td>
                        </tr>`
                tableRef.innerHTML += output; // display table in HTML 
            }
        }
        addRowEventListeners(pastTripsArray); 
    }
}

// displayTripDetailsRow(trip)
// Purpose: Displays extra information (trip index, stops, connecting flights, plane type and airline) for a trip when a specifc row is selected 
// Argument - trip: 'trip' object which contains information for the specific trip selected from the row 
// Return: Does not return anything
function displayTripDetailsRow(trip) {
    let indexRef = document.getElementById("Index"); // reference to DOM
    let numberOfStopsRef = document.getElementById("stops");
    let connectingFlightsRef = document.getElementById("connectingFlights");
    let planeTypeRef = document.getElementById("planeType");
    let airlineRef = document.getElementById("airline");

    indexRef.innerText = trip.index; // gets index of the trip and displays it in the trip details table 
    numberOfStopsRef.innerText = trip.stops.length; // displays the number of stops in the trip details table
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

// getGeocodingAPIDataPastTrips(trip)
// Purpose: Gets the location of country of the trip in order for map to pan to the right place 
// Argument - trip: 'trip' object which contains information for the specific trip selected from the row 
// Return: Does not return anything
function getGeocodingAPIDataPastTrips(trip) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${trip._country}.json/?access_token=${MAPBOX_ACCESS_TOKEN}`)
        .then(response => response.json())
        .then(data => panToCountrySavedTrips(data));
}

// panToCountrySavedTrips(data) 
// Purpose: take location data from the 'getGeocodingAPIDataPastTrips(trip)', and pans the map to the country of the trip booked 
// Argument - data: contains country location of the trip and changes the bounds of the map so that it displays only the country of the booked trip (pans the map to right location)
// Return: Does not return anything
function panToCountrySavedTrips(data) {
    let bounds = data.features[0].bbox;
    pastTripsMap.fitBounds(bounds);
}

// displayPastTripRoutes(trip)
// Purpose: displays the trip icons and routes in the map once a specfic trip is selected 
// Argument - trip: 'trip' object which contains information for the specific trip selected from the row 
// Return: Does not return anything
function displayPastTripRoutes(trip) {

    // locations object contains the cooordinates for all the airports as well as their descriptions
    let locations = [
        {
            coordinates: [trip._initialRoute._sourceAirport._longitude, trip._initialRoute._sourceAirport._latitude],
            description: `City: ${trip._initialRoute._sourceAirport._city}<br>Airport: ${trip._initialRoute._sourceAirport._airportCode}`
        },
        {
            coordinates: [trip._finalRoute._destinationAirport._longitude, trip._finalRoute._destinationAirport._latitude],
            description: `City: ${trip._finalRoute._destinationAirport._city}<br>Airport: ${trip._finalRoute._destinationAirport._airportCode}`
        }
    ];
    // adds the coordinates and descriptions for airports in the stops (so loops through the stops array)
    for (let i = 0; i < trip._stops.length; i++) {
        locations.push({
            coordinates: [trip._stops[i]._destinationAirport._longitude, trip._stops[i]._destinationAirport._latitude],
            description: `City: ${trip._stops[i]._destinationAirport._city}<br>Airport: ${trip._stops[i]._destinationAirport._airportCode}`
        })

    }

    let coords = []; // seperate array which contains only the coordinates of all the airports, taken from the 'location' object 
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
    
    pastTripsMap.addLayer({
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
        popup.addTo(pastTripsMap); // adds popups to the map

        // Display the marker.
        marker.addTo(pastTripsMap);// adds markers to the map

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
            getGeocodingAPIDataPastTrips(trips[i]);
            displayPastTripRoutes(trips[i]);
        });
    }
}

// Code that runs on page load
displayPastTripsMap()
displayPastTripsTable()
