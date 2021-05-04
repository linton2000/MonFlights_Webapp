"use strict"
/**
 * homePage.js
 * This file contains the code that runs when index.html loads.
 * Author: Eng1003 Sem 2 Team 44
 * Last Modified: 30.10.2020
 */


// Access token for API
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZW5nMTAwM3RlYW0wNDQiLCJhIjoiY2tldDlsNDl4MWN4aTJxdDh1aHZ2aWIxNiJ9.pTk-jc23gIBfzI0Cw8V-3A';

// Global Variables:
let newTrip = new Trip();
let homeMap = "";
let airportListFromCallBack = new AirportList();
let layerIdIndex = 0;
let lastLayerIdIndex = 0;
let selectableAirports = [];
let selectedAirportsIndex = 1;
let confirmedAirports = new AirportList;

// airportDropDown()
// Purpose: This function adds the airport the user has selected into the airportListFromCallBack instance. It also calls the addAirportAndRoutes function from a drop down list.
// Argument: This function does not have any arguments
// Returns: does not return anything
function airportDropDown()
{
    let dropDownRef = document.getElementById('airportInput');
    let airports = airportListFromCallBack.airports;
    let output = '<option value=" "> </option>';
    for(let i in airports) // loops through all of the airports 
    {
        let code = airports[i].airportCode; // gets code of airport 
        let city = airports[i].city; // gets city of airport
        output += `<option value="${code}">${code}, ${city}</option>` // The way each airport info will be displayed in the dropdown list 
    }
    dropDownRef.innerHTML = output; // displays info that goes into the dropdown list in HTML 

    dropDownRef.addEventListener('change', function(){
        let airportInstance = airportListFromCallBack.airportInstanceByCode(dropDownRef.value); // when an option from the dropdown list is selected, 
        addAirportAndRoute(airportInstance);
    });
}

// homeDialog()
// Purpose: this function runs on page load. it checks if the user is logged in and retrieves the appropriate information for the dialog box 
// Argument: this function takes no arguments
// Returns: this function does not return anything
function homeDialog() 
{
    let promptRef = document.getElementById('logInPrompt');
    let descriptionRef = document.getElementById('logInPromptDescription');
    let closeButton = document.getElementById('closeButton');
    let logInStatus = false;
    if(checkIfDataExistsLocalStorage(USER_DATA_KEY))
    {
        let userIndex = localStorage.getItem(USER_INDEX_KEY);
        logInStatus = userList.users[userIndex].logInStatus;
    }

    if(logInStatus) //checks if user is logged in , if true the following is displayed 
    {
        promptRef.innerHTML = '';
        descriptionRef.innerHTML = '';
        closeButton.innerText = 'Save Trip';
        closeButton.style.marginTop = '0px';
        closeButton.style.marginLeft = '10px';

        let dialog = document.getElementById('homeDialog');
        let closeRef = document.getElementById('closeArea');
        closeRef.innerHTML = `<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect 
                                mdl-button--accent" id="backDialogButton">Back</button>` + closeRef.innerHTML;

        document.getElementById("backDialogButton").addEventListener('click', () => dialog.close());
        document.getElementById('closeButton').addEventListener('click', () => closeDialog(newTrip));
    }
    else //displays the following if user is not logged in 
    {
        let logInButton = document.getElementById('logInButton');
        let signUpButton = document.getElementById('signUpButton');

        //Event listeners with anonymous functions 
        logInButton.addEventListener('click', function () { saveTrip(newTrip); window.location = 'logIn.html';});
        signUpButton.addEventListener('click', function () { saveTrip(newTrip); window.location = 'signUp.html';});
        closeButton.addEventListener('click', function(){ closeDialog(newTrip)});
    }
}

// saveTrip(tripInstance)
// Purpose: saves the trip and adds it to the tempTripList 
// Argument - tripInstance: trip object that contains all the information for the booked trip 
// Returns: this function does not return anything
function saveTrip(tripInstance)
{
    let tempTripList = new User;
    tempTripList.addTrip(tripInstance);
    updateLocalStorage(tempTripList, TEMP_TRIP_KEY);   
}

// closeDialog(tripInstance)
// Purpose: runs when the 'close' button is clicked on the dialog box. Function updates local storage (saves the trip) and closes the dialog box 
// Argument - tripInstance: trip object that contains all the information for the booked trip 
// Returns: this function does not return anything
function closeDialog(tripInstance)
{
    let dialog = document.getElementById('homeDialog');
    let logInStatus = false;
    let userIndex = 0;
    if(checkIfDataExistsLocalStorage(USER_DATA_KEY))
    {
        userIndex = localStorage.getItem(USER_INDEX_KEY);
        logInStatus = userList.users[userIndex].logInStatus;
    }
    if(logInStatus == true)
    {
        if(confirm('Are you sure you want to save this trip?'))
        {
            userList.users[userIndex].addTrip(tripInstance);
            updateLocalStorage(userList, USER_DATA_KEY);
            alert('Your Trip has been Saved');
            window.location = 'savedTrips.html';
        }
    }
    else
    {
        dialog.close();
    }
}

// confirmTrip()
// Purpose: displays the dialog box (once trip is confirmed) which contains all the detaisl of the tirp booked.
// Argument: this function takes no arguments
// Returns: this function does not return anything
function confirmTrip()
{
    let dialog = document.getElementById('homeDialog');
    let tripSummaryAreaRef = document.getElementById('tripSummaryArea');
    if(newTrip.date == '')// checks that user has entered all the necessary trip information, and gives alerts if otherwise 
    {
        alert('Please enter your date of departure!');
    }
    else if(newTrip.initialRoute == '')
    {
        alert('Please select a route!');
    }
    else
    {
        dialog.showModal();
        let source = newTrip.initialRoute.sourceAirport.airportCode + ', ' + newTrip.initialRoute.sourceAirport.city;
        let destination = newTrip.finalRoute.destinationAirport.airportCode + ', ' + newTrip.finalRoute.destinationAirport.city;
        let airline = newTrip.initialRoute.airline;
        let planeType = newTrip.initialRoute.planeType;
        let stopsString = '';
        for(let i in newTrip.stops)
        {
            stopsString += `${newTrip.stops[i].destinationAirport}, `;
        }
        let stops = stopsString.slice(0, stopsString.length - 3);
        // output contains HMTL for the dialog box 
        let output = `<div class="mdl-cell mdl-cell--6-col">
                        <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
                            <tbody>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>Index:</b></td>
                                    <td>${newTrip.index}</td>
                                </tr>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>Departure Date:</b></td>
                                    <td>${newTrip.date}</td>
                                </tr>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>From:</b></td>
                                    <td>${source}</td>
                                </tr>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>To:</b></td>
                                    <td>${destination}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mdl-cell mdl-cell--6-col">
                        <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
                            <tbody>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>Airline:</b></td>
                                    <td>${airline}</td>
                                </tr>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>Number of Stops:</b></td>
                                    <td>${newTrip.stops.length}</td>
                                </tr>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>Stops:</b></td>
                                    <td>${stops}</td>
                                </tr>
                                <tr>
                                    <td class="mdl-data-table__cell--non-numeric"><b>Plane Type:</b></td>
                                    <td>${planeType}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`;
        tripSummaryAreaRef.innerHTML = output;
    }
}

// cancel()
// Purpose: runs if the cancel button is clicked on the summary box. Will ask user to confirm and then reload the page, removing all of the users airport selections for that trip 
// Argument: this function takes no arguments
// Returns: this function does not return anything
function cancel()
{
    if(confirm('Are you sure you want to delete the routes you have selected so far?'))
    {
        window.location = 'index.html';
    }
}

// displayHomeMap()
// Purpose: displays the interactive map on the homepage 
// Argument: this function takes no arguments
// Returns: this function does not return anything
function displayHomeMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    homeMap = new mapboxgl.Map({
        container: 'homeMap',
        center: [0, 0],     // Default World Map Center
        zoom: 0,            // Fully Zoomed out
        style: 'mapbox://styles/mapbox/streets-v9'
    });
}

// displayAirport(airportInstance)
// Purpose: displays the marker and popup for each airport on the homeMap 
// Argument - aiportInstance: airport to be displayed
// Returns: this function does not return anything
function displayAirport(airportInstance) {

    // Creating an appropriate Popup for each marker:
    let description = `City: ${airportInstance.city} <br> Airport: ${airportInstance.airportCode}`;
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(description);

    //Adding marker and popup to home page map:
    let marker = new mapboxgl.Marker({"color": "#FF8C00" });
    marker.setLngLat([airportInstance.longitude, airportInstance.latitude]);
    marker.setPopup(popup);
    marker.getElement().addEventListener('click', function(){addAirportAndRoute(airportInstance); });

    marker.getElement().addEventListener('mouseenter', function(){marker.togglePopup()});
    marker.getElement().addEventListener('mouseleave', function(){marker.togglePopup()});

    marker.addTo(homeMap);
}

// displayRoute(routeInstance)
// Purpose: displays the routes on the map 
// Argument - routeInstance : an object that contains all the details for each route, including the coordinates of source and destination airport 
// Returns: this function does not return anything
function displayRoute(routeInstance) {
    let object = {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: [
                    [routeInstance.sourceAirport.longitude, routeInstance.sourceAirport.latitude],
                    [routeInstance.destinationAirport.longitude, routeInstance.destinationAirport.latitude]
                ]
            }
        }
    };
    homeMap.addLayer({
        id: 'L' + layerIdIndex,
        type: "line",
        source: object,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#888", "line-width": 6 }
    });
    layerIdIndex++;
}

// panToCountry(data)
// Purpose: pans to the specific country on the map 
// Argument: this function takes no arguments
// Returns: this function does not return anything
function panToCountry(data) 
{
    let bounds = data.features[0].bbox;
    homeMap.fitBounds(bounds);
    getAirportsAPIData();

    let toggleRef = document.getElementById('allRoutesToggle');
    toggleRef.removeAttribute('disabled');

    let labelRef = document.getElementById('toggleLabel');
    let toggleClass = labelRef.className;
    labelRef.className = toggleClass.replace('is-disable', '');

    let airportRef = document.getElementById('airportInput');
    airportRef.removeAttribute('disabled');

    let airportLabelRef = document.getElementById('airportLabel')
    let airportClass = airportLabelRef.className;
    airportLabelRef.className = airportClass.replace('is-disable', '');
}

// addAirportAndRoute(airportInstance)
// Purpose:  Adds the selected airport onto the summary table
// Argument -  airportInstance : contains the specific airport selected 
// Returns: this function does not return anything
function addAirportAndRoute(airportInstance)
{
    let city = '';
    let newRoute = new Route();

    if(selectableAirports.includes(airportInstance) || selectedAirportsIndex == 1)
    {
        // Displays routes on map from selected airport 
        for(let i = lastLayerIdIndex; i < layerIdIndex; i++)
        {
            homeMap.removeLayer('L' + i);
        }
        lastLayerIdIndex = layerIdIndex;
        selectableAirports = [];

        // Classes updated:
        let routes = newTrip.getRoutes();
        if(!(routes[0] instanceof Route))   // Checks if newTrip doesn't have any routes.
        {
            newRoute.sourceAirport = airportInstance;
            confirmedAirports.addAirport(airportInstance);
            newTrip.addRoute(newRoute);
        }
        else {
            for(let i in routes)
            {
                if(routes[i].hasSourceAirport())
                {
                    if(routes[i].hasDestinationAirport())
                    {
                        continue;
                    }
                    else
                    {
                        newRoute.destinationAirport = airportInstance;
                        confirmedAirports.addAirport(airportInstance);
                        newTrip.addRoute(newRoute);
                        break;
                    }
                }
                else
                {
                    newRoute.sourceAirport = airportInstance;
                    confirmedAirports.addAirport(airportInstance);
                    newTrip.addRoute(newRoute);
                    break;
                }
            }
        }
        
        // Inserts HTML Route Information in the summary section:
        let outputRef = '';

        if(airportInstance == newTrip.initialRoute.sourceAirport)
        {
            outputRef = document.getElementById('initialAirport');
        }
        else if(airportInstance == newTrip.finalRoute.destinationAirport)
        {
            outputRef = document.getElementById('finalAirport');
        }
        else
        {
            outputRef = document.getElementById('stops');
        }

        let code = '';
        if(airportInstance.airportCode == '')
        {
            code = 'N/A';
        }
        else
        {
            code = airportInstance.airportCode;
        }

        if(airportInstance.city == '')
        {
            city = 'N/A';
        }
        else
        {
            city = airportInstance.city;
        }

        let prefixId = selectedAirportsIndex + '';
        let output = `<span id="${`Chip: ${airportInstance.airportCode}, ${city}`}" class="mdl-chip">
                          <span class="mdl-chip__text"><b id='${prefixId}'></b> ${code}, ${city}</span>
                      </span><br>`;
        outputRef.innerHTML += output;

        for(let i = 0; i < selectedAirportsIndex; i++)
        {
            let idNum = i + 1;
            let id = idNum + '';
            let prefixRef = document.getElementById(id);
            let airports = confirmedAirports.airports;
            if(airports[i] == newTrip.initialRoute.sourceAirport)
            {
                prefixRef.innerHTML = 'From:';
            }
            else if(airports[i] == newTrip.finalRoute.destinationAirport)
            {
                prefixRef.innerHTML = 'To:';
            }
            else
            {
                prefixRef.innerHTML = 'Via:';
            }
        }

        selectedAirportsIndex++;
        getRoutesAPIData(airportInstance);
    }
    else
    {
        alert('Destination not available directly from selected airport.')
    }
}

// webServiceRequest(url, Data)
// Purpose: to generate a specific url using the data in the argument 
// Argument - url: the URL to which keys are added onto 
// Argument - data: information collected from the API
// Returns: this function does not return anything
function webServiceRequest(url, data) {
    let params = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (params.length == 0) {
                params += "?";
            }
            else {
                params += "&";
            }
            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);
            params += encodedKey + "=" + encodedValue;
        }
    }
    let script = document.createElement('script');
    script.src = url + params;
    document.body.appendChild(script);
}

// getAirportsAPIData()
// Purpose: retrieves data for the airports in the airport instance and calls function 'airportCallBack' with retrieved data as input
// Argument: this function takes no arguments
// Returns: this function does not return anything
function getAirportsAPIData() {
    let airportData = {
        country: newTrip.country,
        callback: 'airportCallBack'
    }
    webServiceRequest("https://eng1003.monash/OpenFlights/airports/", airportData);
}

// getRoutesAPIData(airportInstance)
// Purpose: retrieves data for the routes in the airport instance  and calls function 'routescallBack' with the retrieved data as input 
// Argument - airportInstance: contains the airport selected from the dropdown list 
// Returns: this function does not return anything
function getRoutesAPIData(airportInstance) {
    let routeData = {
        sourceAirport: airportInstance.airportId,
        callback: 'routeCallBack'
    }
    webServiceRequest("https://eng1003.monash/OpenFlights/routes/", routeData);
}

// getAllRoutesAPIData()
// Purpose: retrieves data for all the routes of the selected country and calls function 'allRoutescallBack' with the retrieved data as input 
// Argument: this function takes no arguments
// Returns: this function does not return anything
function getAllRoutesAPIData() { 
    let allRoutesData = {
        country: newTrip.country,
        callback: 'allRoutesCallBack'
    }
    webServiceRequest("https://eng1003.monash/OpenFlights/allroutes/", allRoutesData); 
}

// getGeocodingAPIData()
// Purpose: retrieves location (coordinates) of the country for the specific trip and calls the function 'panToCountry'
// Argument: this function takes no arguments
// Returns: this function does not return anything
function getGeocodingAPIData() {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${newTrip.country}.json/?access_token=${MAPBOX_ACCESS_TOKEN}`)
    .then(response => response.json())
    .then(data => panToCountry(data));
}

// airportCallBack(airportObject)
// Purpose: callback for the function 'getAirportsAPIData()'
// Argument - airportsObject : contains all the information regarding each airport (including coordinates, id, CITY, etc.)
// Returns: this function does not return anything
function airportCallBack(airportsObject) {
    for (let i in airportsObject) {
        let airport = new Airport();
        airport.airportId = airportsObject[i].airportId;
        airport.airportCode = airportsObject[i]['IATA-FAA'];
        airport.city = airportsObject[i].city;
        airport.latitude = airportsObject[i].latitude;
        airport.longitude = airportsObject[i].longitude;
        displayAirport(airport);
        airportListFromCallBack.addAirport(airport);
    }
    airportDropDown();
}

// Routes from a source airport
// Purpose: callback function for 'getRoutesAPIData()' function. Saves all the information about the trip (airline, plantype, airports) in the route object
// Argument - routesObject: contains information about the routes taken from API in the getRoutesAPIData()
// Returns: this function does not return anything
function routeCallBack(routesObject) {
    for (let i in routesObject) {
        let route = new Route(); // creates new route instance 
        let airline = routesObject[i].airline;
        let planeType = routesObject[i].equipment;
        route.sourceAirport = airportListFromCallBack.airportInstanceByCode(routesObject[i].sourceAirport);
        route.destinationAirport = airportListFromCallBack.airportInstanceByCode(routesObject[i].destinationAirport);
        if(route.sourceAirport !== undefined && route.destinationAirport !== undefined)
        {
            displayRoute(route);
            selectableAirports.push(route.destinationAirport);
            newTrip.initialRoute.airline = airline;
            newTrip.initialRoute.planeType = planeType;
        }
    }
}

// allRoutesCallBack(allRoutesObject)
// Purpose: callback function for 'getAllRoutesAPIData()' function. 
// Argument = allRoutesObject: contains information about the routes taken from API in the getAllRoutesAPIData()
// Returns: this function does not return anything
function allRoutesCallBack(allRoutesObject) {
    for (let i in allRoutesObject) {
        let route = new Route();
        route.airline = allRoutesObject[i].airline;
        route.planeType = allRoutesObject[i].equipment;
        route.numOfUnknownStops = allRoutesObject[i].stops;
        //console.log(allRoutesObject[i]);
        route.sourceAirport = airportListFromCallBack.airportInstanceByCode(allRoutesObject[i].sourceAirport);
        route.destinationAirport = airportListFromCallBack.airportInstanceByCode(allRoutesObject[i].destinationAirport);
        if (route.sourceAirport !== undefined && route.destinationAirport !== undefined) {
            displayRoute(route);
        }
    }
}

// function addEventListeners()
// Purpose: this function runs on page load, it contains all the event listeners needed for the homepage (inputs and buttons and all routes toggle)
// Argument: this function takes no arguments
// Returns: this function does not return anything
function addEventListeners() {
    let countryRef = document.getElementById('countryInput');
    countryRef.addEventListener('change', function () {newTrip.country = countryRef.value; getGeocodingAPIData();});

    let dateRef = document.getElementById('dateInput');
    dateRef.addEventListener('change', function () {newTrip.date = dateRef.value; });

    let confirmButton = document.getElementById('confirmButton');
    confirmButton.addEventListener('click', function(){confirmTrip();} );

    let cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', function(){cancel();})

    let toggleRef = document.getElementById('allRoutesToggle');
    toggleRef.addEventListener('click', function()
    {
        if(toggleRef.checked)
        {
            getAllRoutesAPIData();
        }
        else if(toggleRef.checked == false)
        {
            for(let i = lastLayerIdIndex; i < layerIdIndex; i++)
            {
                homeMap.removeLayer('L' + i);
            }
            lastLayerIdIndex = layerIdIndex;
        }
        else
        {
            throw 'Something Wrong! - Linton';
        }
    })
}

// Code that runs on page load here 
homeDialog();
displayHomeMap();
addEventListeners();

if(checkIfDataExistsLocalStorage(USER_DATA_KEY))
{
    let userIndex = localStorage.getItem(USER_INDEX_KEY);
    let user = userList.users[userIndex];
    if(user.logInStatus)
    {
        newTrip.index = user.createTripIndex();
    }
}