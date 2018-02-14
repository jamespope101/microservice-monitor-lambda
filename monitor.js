'use strict';

const NOT_MONITORED = {health: 'NOTMONITORED', version: '-'};
const NONE_MONITORED = {DEV: NOT_MONITORED, TEST: NOT_MONITORED, PROD: NOT_MONITORED};

const request = require('superagent');
const Promise = require('bluebird');

var responseBody = {};

function monitorEndpoints(monitorConfig, requestTimeout) {
    let endpointRequests = [];
    for(const key in monitorConfig) {
        let microservice = monitorConfig[key];
        let serviceName = microservice.shortName;
        if (microservice.doNotMonitor) {
            responseBody[serviceName] = NONE_MONITORED;
        } else {
            responseBody[serviceName] = {};
            for (const environment in microservice.endpoints) {
                let baseUrl = microservice.endpoints[environment];
                if (baseUrl === undefined) {
                    responseBody[serviceName][environment] = {health: 'NOTEXIST', version: '-'};
                } else {
                    responseBody[serviceName][environment] = {version: undefined, health: undefined};
                    endpointRequests.push({url: baseUrl + microservice.healthSlug, service: serviceName, environment: environment, onResponse: springBootHealthUpdate, onError: springBootHealthError});
                    endpointRequests.push({url: baseUrl + microservice.infoSlug, service: serviceName, environment: environment, onResponse: springBootVersionUpdate, onError: springBootVersionError});
                }
            }
        }
    }

    console.log('About to make ' + endpointRequests.length + ' requests to microservice endpoints');
    return Promise.all(endpointRequests.map(endpointRequest => {
        var singleStart = new Date();
        return request.get(endpointRequest.url)
            .timeout({response: requestTimeout, deadline: requestTimeout})
            .then((response) => {
                endpointRequest.onResponse(response, responseBody, endpointRequest.service, endpointRequest.environment);
            })
            .catch((error) => {
                endpointRequest.onError(error, responseBody, endpointRequest.service, endpointRequest.environment);
                console.warn('Request made to %s resulting in error \'%s\'. Execution time: %dms', endpointRequest.url, error.message, new Date() - singleStart);
            });
    })).then(() => responseBody);
}

const springBootHealthUpdate = (response, responseBody, serviceName, environment) => {
    responseBody[serviceName][environment].health = response.body.status;
};

const springBootHealthError = (error, responseBody, serviceName, environment) => {
    responseBody[serviceName][environment].health = 'DOWN';
};

const springBootVersionUpdate = (response, responseBody, serviceName, environment) => {
    responseBody[serviceName][environment].version = response.body.build.version;
};

const springBootVersionError = (error, responseBody, serviceName, environment) => {
    responseBody[serviceName][environment].version = '?';
};

module.exports = {monitorEndpoints: monitorEndpoints};
