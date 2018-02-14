module.exports = {
    micro1: {
        shortName: 'Micro 1',
        healthSlug: '/manage/health',
        infoSlug: '/manage/info',
        endpoints: {
            DEV: 'https://micro1-dev.com',
            TEST: 'https://micro1-test.com',
            PROD: 'https://micro1.com'
        }
    },
    micro2EU: {
        shortName: 'Micro 2 EU',
        healthSlug: '/manage/health',
        infoSlug: '/manage/info',
        endpoints: {
            DEV: 'http://eu-west-1.micro2-dev.com',
            TEST: 'http://eu-west-1.micro2-test.com',
            PROD: 'http://eu-west-1.micro2.com'
        }
    },
    micro2US: {
        shortName: 'Micro 2 US',
        healthSlug: '/manage/health',
        infoSlug: '/manage/info',
        endpoints: {
            DEV: undefined,
            TEST: undefined,
            PROD: 'http://us-west-2.micro2.com'
        }
    },
    nocturnal: {
        shortName: 'Nocturnal',
        doNotMonitor: true
    }
};