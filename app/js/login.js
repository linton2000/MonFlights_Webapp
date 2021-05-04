"use strict"
/**
 * This file contains js for the login.html page.
 * Author: ENG1003 Team 44
 * Last Modified: 1/11/20
 */


// userLogin()
// Purpose: This function runs when the login button is clicked from the login.html page. 
// It accesses the user input for password and username and saves them the variables 'password' and 'username' respectively 
// It loops through all of the users in the userList array and uses the 'authenticate' method to check if the password and username inputed matches those stored in the class for that specific user
// If the login details match, and if a trip was booked while logged out, it adds the trip booked by the user to the tripList and data is stored in local storage then the user is then redirected to the saved trips page
// If the login details don't match, and error message is displayed on the page
// this function has no arguments
// this function has no returns 
function userLogIn() {
    let snackbarContainer = document.getElementById('logInToast');
    let password = document.getElementById("passwordLogIn").value;
    let username = document.getElementById("usernameLogIn").value;
    //userList.fromData(getDataLocalStorage)
    let users = userList.users;
    for (let i in users) {
        if (users[i].authenticate(username, password)) {
            if (checkIfDataExistsLocalStorage(TEMP_TRIP_KEY)) {
                let tempTripList = new User();
                tempTripList.fromData(getDataLocalStorage(TEMP_TRIP_KEY));
                users[i].tripList = tempTripList.tripList;
            }
            userList.users[i].logInStatus = true;

            let index = userList.getIndex(users[i]);
            localStorage.setItem(USER_INDEX_KEY, index); 

            updateLocalStorage(userList, USER_DATA_KEY);
            window.location = "savedTrips.html"; // once user has logged in successfully, they are taken to the savedTrips page.
        }
        else {
            let data = {
                message: 'Username or password entered incorrectly. Please try again.',
                timeout: 2000,
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }
    }
}

// code that runs on page load 
let buttonRef = document.getElementById("logInButton");
buttonRef.addEventListener("click", userLogIn);
