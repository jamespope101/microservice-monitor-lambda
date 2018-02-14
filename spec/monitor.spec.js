const nock = require('nock');
const monitor = require('../monitor');
const testConfig = require('./monitor-config-test');

const requestTimeout = 100;
const delayedResponse = requestTimeout + 5;

var response;

function mockServerResponses() {
    nock('https://micro1-dev.com').get('/manage/health').reply(200, {status: 'UP'});
    nock('https://micro1-dev.com').get('/manage/info').reply(200, {build: {version: '2.14.1'}});
    nock('https://micro1-test.com').get('/manage/health').reply(404);
    nock('https://micro1-test.com').get('/manage/info').reply(404);
    nock('https://micro1.com').get('/manage/health').reply(200, {status: 'WARN'});
    nock('https://micro1.com').get('/manage/info').reply(200, {build: {version: '2.14.3'}});

    nock('http://eu-west-1.micro2-dev.com').get('/manage/health').reply(200, {status: 'UP'});
    nock('http://eu-west-1.micro2-dev.com').get('/manage/info').reply(200, {build: {version: '1.8.10'}});

    nock('http://eu-west-1.micro2-test.com').get('/manage/health').reply(200, {status: 'UP'});
    nock('http://eu-west-1.micro2-test.com').get('/manage/info').reply(200, {build: {version: '1.8.10'}});

    // These 2 responses delayed beyond the allowed request timeout
    nock('http://eu-west-1.micro2.com').get('/manage/health').delay(delayedResponse).reply(200, {status: 'UP'});
    nock('http://eu-west-1.micro2.com').get('/manage/info').delay(delayedResponse).reply(200, {build: {version: '1.8.10'}});

    nock('http://us-west-2.micro2.com').get('/manage/health').reply(200, {status: 'UP'});
    nock('http://us-west-2.micro2.com').get('/manage/info').reply(200, {build: {version: '1.8.10'}});

    nock('https://awesome-dev.com').get('/index.html').reply(200, "<html><span id=\"version\">1.1.7</span></html>");
    nock('https://awesome-test.com').get('/index.html').reply(404);
    nock('https://awesome.com').get('/index.html').reply(200, '<html><span id="version">1.1.2</span></html>');
}

describe('The monitor response', () => {

    beforeAll((done) => {
        mockServerResponses();
        var responsePromise = monitor.monitorEndpoints(testConfig, requestTimeout);
        responsePromise.then(responseJson => {
            response = responseJson;
            done();
        });
    });

    it('contains short names', (done) => {
        expect(Object.keys(response)).toContain('Micro 1');
        expect(Object.keys(response)).toContain('Micro 2 EU');
        expect(Object.keys(response)).toContain('Micro 2 US');
        expect(Object.keys(response)).toContain('Nocturnal');
        done();
    });

    it('gives NOTMONITORED response if service is not supposed to be monitored', (done) => {
        expect(response['Nocturnal']).toEqual({
            DEV: {health: 'NOTMONITORED', version: '-'},
            TEST: {health: 'NOTMONITORED', version: '-'},
            PROD: {health: 'NOTMONITORED', version: '-'}
        });
        done();
    });

    it('should show NOTEXIST if endpoint undefined', (done) => {
        expect(response['Micro 2 US'].DEV.health).toEqual('NOTEXIST');
        expect(response['Micro 2 US'].DEV.health).toEqual('NOTEXIST');
        expect(response['Micro 2 US'].TEST.version).toEqual('-');
        expect(response['Micro 2 US'].TEST.version).toEqual('-');
        done();
    });

    it('includes the health from a health check call', (done) => {
        expect(response['Micro 1'].DEV.health).toEqual('UP');
        expect(response['Micro 1'].PROD.health).toEqual('WARN');
        done();
    });

    it('includes the build version from an info call', (done) => {
        expect(response['Micro 1'].DEV.version).toEqual('2.14.1');
        expect(response['Micro 1'].PROD.version).toEqual('2.14.3');
        done();
    });


    it('should show DOWN if endpoint returns an error response', (done) => {
        expect(response['Micro 1'].TEST.health).toEqual('DOWN');
        expect(response['Micro 1'].TEST.version).toEqual('?');
        done();
    });

    it('should show DOWN if endpoint response times out', (done) => {
        expect(response['Micro 2 EU'].PROD.health).toEqual('DOWN');
        expect(response['Micro 2 EU'].PROD.version).toEqual('?');
        done();
    });

});