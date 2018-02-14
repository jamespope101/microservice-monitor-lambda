// time in milliseconds after which an endpoint request will timeout.
// If any response is unusually delayed, this (plus Lambda warm-up time and API Gateway latency) will roughly be the execution time of the Lambda
const requestTimeout = 2000;

const monitor = require('./monitor');
const monitorConfig = require('./monitor-config');

exports.handler = function (event, context, callback) {
    var monitorPromise = monitor.monitorEndpoints(monitorConfig, requestTimeout);

    var allStart = new Date();
    monitorPromise.then((monitorJson) => {
        console.info('Execution time for parallel requests: %dms', new Date() - allStart);
        var response = {
            statusCode: 200,
            body: JSON.stringify(monitorJson, null, 2),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        };
        callback(null, response);
    })
        .catch(err => callback(err, null));
};