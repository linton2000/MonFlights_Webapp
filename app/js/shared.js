"use strict"
/**
 * shared.js
 * This file contains shared code that runs on HTML pages. 
 * It includes all the classes, local storage functions, global
 * UserList variable and any functions relating to the navigation 
 * bar and menu.
 * Author: Eng1003 Sem 2 Team 44
 * Last Modified: 30.10.2020
 */


// Global Keys
const USER_DATA_KEY = "UserList Instance Key: alsdgbfiasrfg";
const USER_INDEX_KEY = "User Instance Index Key: jiahihr";
const TEMP_TRIP_KEY = "Temporary Trip Instance Key: aiwrufblqyf";

class Airport {
    // Adding an id attribute for handling the route API
    constructor(airportCode, airportId, city, latitude, longitude) {
        // Removed country attribute because it's handled by the Trip class - Linton
        this._airportId = airportId;
        this._airportCode = airportCode;
        this._city = city;
        this._latitude = latitude;
        this._longitude = longitude;
    }

    get airportId() { return this._airportId; }
    get airportCode() { return this._airportCode; }
    get city() { return this._city; }
    get latitude() { return this._latitude; }
    get longitude() { return this._longitude; }

    set airportId(id) { this._airportId = id; }
    set airportCode(code) { this._airportCode = code; }
    set city(newCity) { this._city = newCity; }
    set latitude(newLat) { this._latitude = newLat; }
    set longitude(newLong) { this._longitude = newLong; }

    toString()
    // unfinished
    {
        return this._airportCode
    }

    fromData(data) {
        this._airportId = data._airportId;
        this._airportCode = data._airportCode;
        this._city = data._city;
        this._latitude = data._latitude;
        this._longitude = data._longitude;
    }
}

class AirportList {
    constructor() {
        this._airports = [];
    }

    get airports() { return this._airports };

    addAirport(airportInstance) {
        if (airportInstance instanceof Airport) {
            this._airports.push(airportInstance);
        }
        else {
            throw "Error: Argument to addAirport() is not an Airport instance - Linton";
        }
    }
    removeAirport(airportInstance) {
        if (airportInstance instanceof Airport) {
            for (let i in this._airports) {
                if (airportInstance === this._airports[i]) {
                    this._airports.splice(i, 1);
                }
            }
        }
        else {
            throw "Error: Argument to removeAirport() is not an Airport instance - Linton";
        }
    }
    airportInstanceByCode(code) {
        if (this._airports.length > 0) {
            for (let i in this._airports) {
                if (code == this._airports[i].airportCode) {
                    return this._airports[i];
                }
            }
        }
        else {
            throw "Error: AirportList instance was empty when airportInstanceByCode() was called - Linton"
        }
    }
}

class Route {
    constructor(airline, sourceAirport, destinationAirport, planeType, numOfUnknownStops) {
        this._airline = airline;
        this._sourceAirport = sourceAirport;
        this._destinationAirport = destinationAirport;
        this._planeType = planeType;
    }
    get airline() { return this._airline; }
    get sourceAirport() { return this._sourceAirport; }
    get destinationAirport() { return this._destinationAirport; }
    get planeType() { return this._planeType; }

    set airline(newAirline) { this._airline = newAirline; }
    set sourceAirport(newSourceAirport) { this._sourceAirport = newSourceAirport; }
    set destinationAirport(newDestinationAirport) { this._destinationAirport = newDestinationAirport; }
    set planeType(newPlaneType) { this._planeType = newPlaneType; }

    // Methods:
    hasSourceAirport() {
        if (this._sourceAirport instanceof Airport) {
            return true;
        }
        else {
            return false;
        }
    }
    hasDestinationAirport() {
        if (this._destinationAirport instanceof Airport) {
            return true;
        }
        else {
            return false;
        }
    }

    fromData(data) {
        this._airline = data._airline;
        this._planeType = data._planeType;

        if (data._sourceAirport != undefined) {
            let newSourceAirport = new Airport;
            this._sourceAirport = newSourceAirport.fromData(data._sourceAirport);
            console.log(this._sourceAirport);
        }
        else if (data._destinationAirport != undefined) {
            this._destinationAirport = data._destinationAirport;
        }
    }
}

class Trip {
    // constructor 
    constructor(date, country) {
        this._initialRoute = '';
        this._finalRoute = '';
        this._stops = [];
        this._index = 1;
        this._date = '';
        this._country = '';
        this._current = true;
    }

    // accessors
    get index() { return this._index }
    get country() { return this._country; }
    get date() { return this._date; }
    get initialRoute() { return this._initialRoute; }
    get finalRoute() { return this._finalRoute; }
    get stops() { return this._stops; }
    get current() { return this._current; }

    // mutators
    set index(newIndex) { this._index = newIndex; }
    set country(newCountry) { this._country = newCountry; }
    set date(newDate) { this._date = newDate; }
    set initialRoute(newRoute) { this._initialRoute = newRoute; }
    set finalRoute(newRoute) { this._finalRoute = newRoute; }

    // methods
    getRoutes() {
        let routes = [];
        routes.push(this._initialRoute);
        for (let i in this._stops) {
            routes.push(this._stops[i]);
        }
        routes.push(this._finalRoute);
        return routes;
    }

    addRoute(newRoute) {
        if (newRoute instanceof Route) {
            if (this._initialRoute instanceof Route && this._finalRoute instanceof Route) {
                this._stops.push(this._finalRoute);
                this._finalRoute = newRoute;
            }
            else if (this._initialRoute == '') {
                this._initialRoute = newRoute;
            }
            else if (this._finalRoute == '') {
                this._finalRoute = newRoute;
            }
            else {
                throw "Error: Something went wrong with addRoute() in the Trip class - Linton";
            }
        }
        else {
            throw "Error: Argument to newRoute() is not a Route instance - Hash";
        }
    }

    removeRoute(cancelledRoute) {
        if (cancelledRoute instanceof Route) {
            for (let i in this._routes) {
                if (cancelledRoute === this._routes[i]) {
                    this._routes.splice(i, 1);
                }
            }
        }
        else {
            throw "Error: Argument to removeRoute() is not a Route instance - Hash";
        }
    }

    checkIfCurrent(index) {
        // get date of trip in milliseconds, and get current date in milliseconds and if current date < trip date, this trip goes to 
        let tripDate = this._date.getTime()
        let todayDate = Date.now().getTime();
        if (tripDate < todayDate) {
            this._current = false;
        }
        else {
            this._current = true;
        }
    }

    checkIfRouteExists(sourceAirport, destinationAirport) {
        let routes = [];
        routes.push(this._initialRoute);
        for (let i in this._stops) {
            routes.push(this._stops[i]);
        }
        routes.push(this._finalRoute);

        for (let i in routes) {
            if (sourceAirport == routes[i].sourceAirport && destinationAirport == routes[i].destinationAirport) {
                return true;
            }
        }
        return false;
    }

    fromData(data) {

        let stops = data._stops;
        this._stops = [];
        for (let i in stops) {
            let stop = new Route();
            stop.fromData(stops[i]);
            this._stops.push(stop);
        }

        this._initialRoute = data._initialRoute;
        this._finalRoute = data._finalRoute;

        this._index = data._index;
        this._date = data._date;
        this._country = data._country;
        this._current = data._current;
    }
}

class User {
    constructor(firstName = "", userName = "", emailAddress = "", password = "") {
        this._firstName = firstName;
        this._userName = userName;
        this._emailAddress = emailAddress;
        this._password = password;
        this._tripList = []; // new trip is to be saved here
        this._logInStatus = false;
    }

    get firstName() { return this._firstName; }
    get userName() { return this._userName; }
    get emailAddress() { return this._emailAddress; }
    get tripList() { return this._tripList; }
    get logInStatus() { return this._logInStatus; }

    set logInStatus(status) { this._logInStatus = status; }
    set tripList(newTrips) { this._tripList = newTrips; }

    createTripIndex() {
        if (this._tripList.length > 0) {
            let index = this._tripList[this._tripList.length - 1].index + 1;
            return index;
        }
        else {
            return 1;
        }
    }

    addTrip(newTrip) {
        if (newTrip instanceof Trip) {
            this._tripList.push(newTrip);
        }
        else {
            throw "Error: Argument to addTrip() is not a Trip instance - Linton";
        }
    }

    cancelTrip(cancelledTrip) {
        if (cancelledTrip instanceof Trip) {
            for (let i in this._tripList) {
                if (cancelledTrip === this._tripList[i]) {
                    this._tripList.splice(i, 1);
                }
            }
        }
        else {
            throw "Error: Argument to cancelTrip() is not a Trip instance - Linton";
        }
    }

    authenticate(inputUserName, inputPassword) {
        if (inputUserName === this._userName && inputPassword === this._password) {
            return true;
        }
        else {
            return false;
        }
    }

    logOut() {
        if (user instanceof User) {
            this._logInStatus = false;
        }
        else {
            throw "Error: Argument to logOut() is not a User instance - Linton";
        }
    }

    organiseTrips() {
        let tripsObject = { pastTrips: [], savedTrips: [] }
        for (let i = 0; i < this._tripList.length; i++) {
            if (this._tripList[i].current) {
                tripsObject.pastTrips.push(this._tripList[i]);
            }
            else {
                tripsObject.savedTrips.push(this.tripList[i]);
            }
        }
        return tripsObject;
    }

    toString() {
        let output = `First Name: ${this._firstName}\nUser Name: ${this._userName}\n
                      Email Address: ${this._emailAddress}\n Number of Trips: ${this.tripsCount}`;
        return output;
    }

    fromData(data) {
        this._firstName = data._firstName;
        this._userName = data._userName;
        this._emailAddress = data._emailAddress;
        this._password = data._password;
        this._logInStatus = data._logInStatus;

        let trips = data._tripList;
        this._tripList = [];
        for (let i in trips) {
            let trip = new Trip;
            trip.fromData(trips[i]);
            this._tripList.push(trip);
        }
    }
}

class UserList {
    constructor() {
        this._users = [];
    }

    get users() { return this._users; }
    get count() { return this.user.length; }

    addUser(newUser) {
        if (newUser instanceof User) {
            // The sign up function must specify the 8 character password requirement - Linton
            this._users.push(newUser);
        }
        else {
            throw "Error: Argument to addUser() is not a User instance - Linton";
        }
    }
    logIn(username, password) {
        let valid = false
        for (let i in this._users) {
            if (this._users[i].authenticate(username, password)) {
                this._users[i].logInStatus = true;
                // this bit has been changed
                localStorage.setItem(USER_INDEX_KEY, i);
                valid = true;
            }
        }
        // changed (khanh): got rid of the else, fixed some bugs
        return valid;
    }

    getIndex(userInstance) {
        for (let i in this._users) {
            if (userInstance == this._users[i]) {
                return i;
            }
        }
        throw 'Unable to retrieve Index (Linton)'
    }

    toString() {
        let output = `Number of Users: ${userList.count}`;
        return output;
    }
    fromData(data) {
        let users = data._users;
        this._users = [];
        for (let i in users) {
            let user = new User;
            user.fromData(users[i]);
            this._users.push(user);
        }
    }
}

// addNavigationEventListeners() 
// Purpose: Adds events listeners to the navigation bar to allow the buttons to navigate to different pages.
// Argument: this function takes no arguments
// Returns: this function does not return anything
function addNavigationEventListeners() {
    // Navigation Drawer
    let homeButton = document.getElementById('homePage');
    let navigtionButtonSavedTrips = document.getElementById('savedTrips');
    let navigtionButtonPastTrips = document.getElementById('pastTrips');

    navigtionButtonSavedTrips.addEventListener('click', function () { tripsDialog('savedTrips'); });
    navigtionButtonPastTrips.addEventListener('click', function () { tripsDialog('pastTrips'); });
    homeButton.addEventListener('click', function () { window.location = 'index.html' });
}

// tripDialog(tripsPage)
// Purpose: Informs the user of the where they can go after booking a trip. If they are logged in, they can move to saved trips page. If they aren't logged in, users are asked to log in or sign up to view their trips.
// Argument - tripsPage: page that the dialogue will be redirected to
// Returns: this function does not return anything
function tripsDialog(tripsPage) {
    // Saved and Past Trips Dialog:
    let logInButton_trips = document.getElementById('logInButton_trips');
    let signUpButton_trips = document.getElementById('signUpButton_trips');
    let backButton = document.getElementById('backButton');
    let logInStatus = false;

    if (checkIfDataExistsLocalStorage(USER_DATA_KEY)) {
        let userIndex = localStorage.getItem(USER_INDEX_KEY);
        logInStatus = userList.users[userIndex].logInStatus;
    }

    if (logInStatus == false) {
        let dialog = document.getElementById('tripsDialog');
        dialog.showModal();

        logInButton_trips.addEventListener('click', function () { window.location = 'login.html' });
        signUpButton_trips.addEventListener('click', function () { window.location = 'signup.html' });
        backButton.addEventListener('click', function () { dialog.close(); });
    }
    else if (logInStatus == true) {
        if (tripsPage == 'savedTrips') {
            window.location = 'savedTrips.html';
        }
        else if (tripsPage == 'pastTrips') {
            window.location = 'pastTrips.html';
        }
    }
}

// Local Storage functions

// checkIfDataExistsLocalStorage(key)
// Purpose: to check if any data is stored at the given key
// Argument - key : the key to access data stored in local stoage
// Returns: this function does not return anything
function checkIfDataExistsLocalStorage(key) {
    let jsonString = localStorage.getItem(key);
    let exists = false;
    if (jsonString != undefined && jsonString != "" && jsonString != null && jsonString != `""`) {
        exists = true;
    }
    return exists;
}

// updateLocalStorage(data, key)
// Purpose: To update the local storage with the data and key
// Argument - data: information to be stored at the location of the key in local storage
// Argument - key: the key to access data stored in local storage
// Returns: this function does not return anything
function updateLocalStorage(data, key) {
    let jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
}

// getDataLocalStorage(key)
// Purpose: to get data from local storage
// Argument - key: the key to access data stored in local storage
// Returns: this function does not return anything
function getDataLocalStorage(key) {
    let jsonString = localStorage.getItem(key);
    let data = JSON.parse(jsonString);
    return data;
}

// Global UserList instance variable
let userList = new UserList();


addNavigationEventListeners();
if (checkIfDataExistsLocalStorage(USER_DATA_KEY)) {
    userList.fromData(getDataLocalStorage(USER_DATA_KEY));

    // Displaying Log-In status:
    let logInRef = document.getElementById('logInElement');
    let logOutRef = document.getElementById('logOutElement');

    let userIndex = localStorage.getItem(USER_INDEX_KEY);
    let user = userList.users[userIndex];
    if (user.logInStatus) {
        let output = `<nav class="mdl-navigation mdl-layout--large-screen-only">
                          <a class="mdl-navigation__link" href="#">Hello, ${user.firstName}</a>
                      </nav>`;
        logInRef.innerHTML = output;

        let logOutHTML = `<button class="mdl-button" id="logOutButton">Log Out</button>`;
        logOutRef.innerHTML = logOutHTML;
        let logOutButton = document.getElementById('logOutButton')
        logOutButton.addEventListener('click', function () {
            userList.users[userIndex].logInStatus = false;
            updateLocalStorage(userList, USER_DATA_KEY);
            window.location = 'index.html';
        });
    }
}