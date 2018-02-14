const lambda = require('./microservice-monitor-lambda');

lambda.handler({timeout: 500}, null, (error, response) => {
    console.log(response);
});
