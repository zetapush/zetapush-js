// Script used to create a sandbox on the STR RAM (on localhost)
var http = require('http');

const SERVER_HOSTNAME = "http://localhost"
const SERVER_PORT = 10080
const SERVER_PATH = "/zbo/pub/business"
const AUTH_USERNAME = "user"
const AUTH_PASSWORD = "L5KLm9Ya2455DXYZ"
const NAME_SANDBOX = "[V3] - Testing"
const DESCRIPTION = new Date().toString()
const CLUSTER = null


/**
 * Authentication on the server to create a sandbox
 * @param serverUrl 
 * @param username 
 * @param password 
 */
function authenticationOnServer(hostnameServer, portServer, pathServer, username, password) {
    
    const options = {
        hostname: hostnameServer,
        port: portServer,
        path: `/zbo/auth/login`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    var req = http.request(options, function(res) {
        console.log('AuthenticationOnServer::RequestStatus : ', res.statusCode)
        
        res.setEncoding('utf8');
        request.on('data', function(body) {
            console.log('AuthenticationOnServer::Body : ', body)
        })
    })

    req.on('error', function(err) {
        console.error('AuthenticationOnServer::Error : ', err.message);
    });


    req.write(`{
       "username": "${username}",
       "password": "${password}"
    }`);

    req.end();
}

function getClusterId(serverUrl, user, cluster) {
    // TODO
}

function createSandbox(serverUrl, user, alias, name, description, clusterId) {

}

// RUN THE SCRIPT
authenticationOnServer(SERVER_HOSTNAME, SERVER_PORT, SERVER_PATH, AUTH_USERNAME, AUTH_PASSWORD)
