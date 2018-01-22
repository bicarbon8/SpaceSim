// Load the http module to create an http server.
var http = require('http');
var qs = require('querystring');
var fs = require('fs');

var proxyResponse = function (data, err) {
    return { data: data, err: err };
};

function handleRequests(data, request, response) {
    var respBody;
    try {
        var path = request.url;
        if (path == '/') {
            path = '/babylon.html';
        }
        respBody = fs.readFileSync('.' + path);
        response.writeHead(200, { "Content-Type": getContentType(path) });
        response.end(respBody);
    } catch (err) {
        console.log(err);
    }
}

function getContentType(path) {
    if (path.match(/.*(.css)/)) {
        return 'text/css';
    }

    if (path.match(/.*(.js)/)) {
        return 'text/javascript';
    }

    return 'text/html';
}

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
    var data = '';

    request.on('data', function (chunk) {
        data += chunk;
    });
    request.on('end', function () {
        // console.log(data);
        handleRequests(data, request, response);
    });
});
server.on('error', function (err) {
    console.log(err);
});

// Listen on port 9898, IP defaults to 127.0.0.1
server.listen(9898);