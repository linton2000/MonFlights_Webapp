"use strict"
/**
 * This file contains js for the signup.html page.
 * Author: ENG1003 Team 44
 * Last Modified: 1/11/20
 */


// validNewUser()
// Purpose: This function checks if all fields are filled in
// argument: firstName: this is the first name inputed by the user 
// argument: username: this is the username for the acocunt, inputed by the user 
// argument: emailAddress: this is the email address inputed by the user 
// argument: password: this is the password for the account, inputed by the user 
// returns: this function returns true (stored in the variable 'valid') if all the input fields are filled in, otherwise it will return false 
function validNewUser(firstName, username, emailAddress, password) {
  let valid = false;
  // checking if none of the fields are empty
  if (username != "" && firstName != "" && emailAddress != "" && password != "") {
    valid = true;
  }
  return valid;
}


// signUp()
// Purpose: This function will run when the sign up button is clicked on the signup.html page 
// It stores all the user inputs (username, first name, email address and password) into their respective variables 
// it checks if all the input fields are filled by calling the 'validNewUser' (if all fields are not filled in, and alert will be given) function and then stores the trip booked by the user before signing up into the tripList array (if the user booked a trip) and updates local storage
// the user is then redirected to the saved trips page by calling the gotoSavedTrips() function 
// This function has no arguments 
// This function has no returns 
function signUp() {
  let snackbarContainer = document.getElementById('signUpToast');
  let username = document.getElementById("usernameSignUp").value;
  let firstName = document.getElementById("firstName").value;
  let emailAddress = document.getElementById("emailAddress").value;
  let password = document.getElementById("passwordSignUp").value;
  let data = {};
  let signedUp = false;
  if (validNewUser(firstName, username, emailAddress, password)) {
    let newUser = new User(firstName, username, emailAddress, password);
    if (checkIfDataExistsLocalStorage(TEMP_TRIP_KEY)) {
      let tempTripList = new User();
      tempTripList.fromData(getDataLocalStorage(TEMP_TRIP_KEY));
      newUser.tripList = tempTripList.tripList;
      updateLocalStorage('', TEMP_TRIP_KEY);
    }
    newUser.logInStatus = true;
    userList.addUser(newUser);
    let index = userList.getIndex(newUser);
    localStorage.setItem(USER_INDEX_KEY, index);
    updateLocalStorage(userList, USER_DATA_KEY);

    data = {
      message: 'Your account has been created successfully.',
      timeout: 2000,
    };
    signedUp = true;
  }
  else {
    data = {
      message: 'Please fill in all fields.',
      timeout: 2000,
    };
  }
  snackbarContainer.MaterialSnackbar.showSnackbar(data);
  if (signedUp) {
    setTimeout(gotoSavedTrips, 1000)
  }
}


// gotoSavedTrips()
// Purpose: This function redirects user to the saved trips page 
// it is called in the signUp() function is sign up has been successful
// This function has no arguments 
// This function has no returns
function gotoSavedTrips() {
  window.location = "savedTrips.html";
}

// code that runs on page load
let snackBarButtonRef = document.getElementById('signUpSnackBar');
snackBarButtonRef.addEventListener("click", signUp)


