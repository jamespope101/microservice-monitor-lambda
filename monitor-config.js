module.exports = {
    micro1: {
        shortName: 'Micro 1',
        healthSlug: '/manage/health',
        infoSlug: '/manage/info',
        endpoints: {
            DEV: 'https://micro1-jamespope101-dev.com',
            TEST: 'https://micro1-jamespope101-test.com',
            PROD: 'https://micro1-jamespope101.com'
        }
    },
    micro2: {
        shortName: 'Micro 2 Not All Regions',
        healthSlug: '/manage/health',
        infoSlug: '/manage/info',
        endpoints: {
            DEV: 'https://micro2-jamespope101-dev.com',
            TEST: 'https://micro2-jamespope101-test.com',
            PROD: undefined // if URL undefined, JSON response will say it does not exist
        }
    },
    micro3CannotMonitor: {
        shortName: 'Micro 3', // e.g. a microservice which we cannot currently monitor, for instance service not yet accessible by HTTP
        doNotMonitor: true
    }
};