var express = require("express");
var app = express(); // This responds with "Hello World" on the homepage

// Installed three external libraries "lodash", "xmlhttprequest" and "moodle-client"
var moodle_client = require("moodle-client");
var _ = require("lodash");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// This class contains constructor with all moodle information
class md_client {
  // This constructor contains all moodle information
  constructor() {
    this.moodle_url = "https://mdl.webdevteam.unic.ac.cy";
    this.moodle_token = "0027fd789e4fb844c72e096249d9a6b2";
    // ! FIXME: This part of code should be implemented when we'll have access to the moodle.status
    // this.moodle_status = get_option('shortcourses_custom_moodle_status');
  }
}

const md_client_using = new md_client();

moodle_client
  .init({
    wwwroot: md_client_using.moodle_url, //Entering your modle url
    token: md_client_using.moodle_token, //Entering your token
    // ! FIXME: This part of code should be implemented when we'll have access to the moodle.status
    // moodle_status:md_client_using.moodle_status,
  })
  // Checking for an possible errors with error message
  .catch(function (err) {
    console.log("Unable to initialize the client: " + err);
  });

/** PHP function that was implemented in NodeJS. Checks if Object is empty.
 * @param  {Object} object Object that is gonna be checked
 * @return {boolean} return conditions of object(if empty = true, else => false)
 */
function isEmpty(object) {
  // Not http
  return Object.keys(object).length === 0;
}

/** This function creates a GET request to the moodle
 * @param  {String} theUrl Contains the path for the link
 * @return {Object} That contains request data
 */
function get(theUrl) {
  // GET request
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", md_client_using.moodle_url + theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

/**  This function checks if settings was integrated
 * @return String JSON Object that contains information about condition of the settings
 */
function checkintegrationsettings() {
  // Not http
  // ******************************************
  // TODO: This part of code should be implemented when we'll have access to the moodle.status
  // Checking if moodle status contains "yes"
  // if (_.isEqual(md_client_using.moodle_status, "yes") === 0) {
  // ******************************************

  // Checking if either of token or url doesn't contain any information
  if (
    isEmpty(md_client_using.moodle_token) ||
    isEmpty(md_client_using.moodle_url)
  ) {
    return JSON.stringify({
      status: "error",
      message:
        "One or more integration settings are empty. Please complete all moodle integration settings",
    });
  } else {
    return JSON.stringify({
      status: "success",
    });
  }
  // ******************************************
  // TODO: This part of code should be implemented when we'll have access to the moodle.status
  // } else {
  //   return JSON.stringify({
  //     status: "error",
  //     message: "Service is disabled",
  //   });
  // }
  // ******************************************
}

/** This function generates a random password. This function requires "lodash" library
 * @param  {number} length=8 The length of the password to be generated
 * @param  {boolean} add_dashes=false This parameter selects whether the password should be separated by a sign - or not
 * @param  {string} available_sets="luds" This string selects which characters the password should include
 * @return {string} Returns generated random password
 */
function random_str(length = 8, add_dashes = false, available_sets = "luds") {
  // Not http
  var sets = [];
  if (available_sets.indexOf("l") >= 0) {
    sets.push("abcdefghjkmnpqrstuvwxyz");
  }
  if (available_sets.indexOf("u") >= 0) {
    sets.push("ABCDEFGHJKMNPQRSTUVWXYZ");
  }
  if (available_sets.indexOf("d") >= 0) {
    sets.push("123456789");
  }
  if (available_sets.indexOf("s") >= 0) {
    sets.push("!@#$%*?");
  }
  var all = "";
  var password = "";
  sets.forEach((set) => {
    password += set[Math.floor(Math.random() * set.length)];
    all += set;
  });
  all = all.split("");
  for (var i = 0; i < length - sets.length; i++)
    password += all[Math.floor(Math.random() * all.length)];
  password = _.shuffle(password) + "";
  password = password.replace(/,/g, "");
  if (!add_dashes) return password;
  var dash_len = Math.floor(Math.sqrt(length));
  var dash_str = "";
  while (password.length > dash_len) {
    dash_str += password.substr(0, dash_len) + "-";
    password = password.substr(dash_len);
  }
  dash_str += password;
  return dash_str;
}

app.get("/checkifuserexist", function (req, res) {
  let status = JSON.parse(checkintegrationsettings());
  // If status does not contain any information send an error
  if (!status) {
    res.send(
      JSON.stringify({
        status: "error",
        message: "Service disabled or not properly configured!",
      })
    );
  } else {
    //Creating a link for a moodle webservice
    let params =
      "/webservice/rest/server.php?wstoken=" +
      md_client_using.moodle_token +
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req["email"]) +
      "&moodlewsrestformat=json";
    // Preparing result with all users data taken from a moodle
    let result = get(params);
    result = JSON.parse(result);
    //Checking for amount of the users. And if there is more than 0 user, then send the first ones id in a string
    if (result.users.length < 1) {
      res.send(
        JSON.stringify({
          status: "success",
          exist: false,
        })
      );
    } else {
      res.send(
        JSON.stringify({
          status: "success",
          exist: true,
          user_id: result.users[0].id,
        })
      );
    }
  }
});

app.post("/createuser", function (req, res) {
  // POST request
  let status = JSON.parse(checkintegrationsettings());
  // If status does not contain any information send an error
  if (!status) {
    res.send(
      JSON.stringify({
        status: error,
        message: "Service disabled or not properly configured!",
      })
    );
  } else {
    checkexist = JSON.parse(checkifuserexist(req.user["email"]));
    if (checkexist.status) {
      if (checkexist.exist) {
        res.send(
          JSON.stringify({
            status: "success",
            new_user: false,
            user_id: checkexist.user_id,
            message: "User Already Exist in moodle",
          })
        );
      } else {
        //Creating a link for a moodle webservice
        let paramStr =
          "/webservice/rest/server.php?wstoken=" + md_client_using.moodle_token;
        paramStr +=
          "&wsfunction=core_user_create_users&users[0][username]=" +
          encodeURI(req.user["email"].toLowerCase());
        paramStr +=
          "&users[0][password]=" +
          encodeURI(req.user["password"]) +
          "&users[0][email]=" +
          encodeURI(req.user["email"]);
        paramStr +=
          "&users[0][firstname]=" +
          encodeURI(req.user["name"]) +
          "&users[0][lastname]=" +
          encodeURI(req.user["last"]);
        paramStr +=
          "&users[0][customfields][0][type]=programid&users[0][customfields][0][value]=IFF";
        paramStr += "&moodlewsrestformat=json";
        // Preparing result with all users data taken from a moodle
        let result = JSON.parse(get(paramStr));
        //Checking for an error while creating a user with error detecting algorithm. If there is no error => creating a user
        if (result) {
          if (result.exception) {
            res.send(
              JSON.stringify({
                status: "error",
                message: `Error on Creating user: ${result.errorcode}`,
              })
            );
          } else {
            moodle_user_id = result[0].id;
            res.send(
              JSON.stringify({
                status: "success",
                new_user: true,
                user_id: moodle_user_id,
                message: "User created",
              })
            );
          }
        } else {
          res.send(
            JSON.stringify({
              status: "error",
              message: "Error on creating the user",
            })
          );
        }
      }
    } else {
      res.send(
        JSON.stringify({
          status: "error",
          message: checkexist.message,
        })
      );
    }
  }
});

app.patch("/squares/:x/:y/paint", (req, res, next) => {
  const x = req.params.x;
  const y = req.params.y;
  const changes = req.body;

  const originalInformation = retrieveOriginalInformationInMatrix(x, y);
  // originalInformation will be {"x": 1, "y": 2, "painted": false }    let modifiedInformation = originalInformation
  if (changes.painted !== undefined) {
    modifiedInformation.painted = changes.painted; // Updates new information with desired changes
  }
  // Other possible changes like changes.x or changes.ysaveModifiedInformation(x, y, modifiedInformation);

  res.send(modifiedInformation); // Returns modified information back to user
});

app.delete("/del_user", function (req, res) {
  console.log("Got a DELETE request for /del_user");
  res.send("Hello DELETE");
}); // This responds a GET request for the /list_user page.

app.get("/list_user", function (req, res) {
  console.log("Got a GET request for /list_user");
  res.send("Page Listing");
}); // This responds a GET request for abcd, abxcd, ab123cd, and so on

app.get("/ab*cd", function (req, res) {
  console.log("Got a GET request for /ab*cd");
  res.send("Page Pattern Match");
});

var server = app.listen(8081, function () {
  // var host = server.address().address;
  // var port = server.address().port;

  var host = "localhost";
  var port = 8081;

  console.log("Example app listening at http://%s:%s", host, port);
});
