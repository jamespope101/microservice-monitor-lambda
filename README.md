Microservice Monitor Lambda
=============
An AWS Lambda which monitors Spring Boot microservices (via the actuator /health and /info endpoints) across environments and regions. The JSON response is designed to be accessible via API Gateway

How It Works
-------------
The Lambda makes asynchronous HTTP requests to the /health and /info endpoints of a Spring Boot microservice, across multiple services
and production environments (e.g. dev, test, prod), using the URLs configured in `monitor-config.js`.
This code assumes a consistency of configuring Spring Boot Actuator for each microservice, but could easily be modified to suit needs.
Each service's build version and health check are collected from the HTTP responses are then aggregated into a single JSON response, ready to bind to
a custom monitoring dashboard or as needs suit.

Run Locally
------------
`node local`: runs the Lambda handler locally (via wrapper file `local.js`), printing out the JSON response to console
`npm test`: runs unit tests (alternatively run `jasmine` if installed)

Configuration
--------------
The microservices to monitor are configured in `monitor-config.js`.

Deployment Suggestions
-----------------------
Designed for deploying as an AWS Lambda, triggered by a GET request on Amazon API Gateway.

Comments
---------
The execution time of the Lambda will roughly be the sum of the following times:

- API Gateway latency
- warm-up time for initialising the Lambda
- The execution of the slowest microservice endpoint response time (since all requests are made in parallel). 
This will be the configured requestTimeout if any of the responses time out.