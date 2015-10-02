module.exports = {
    FARMER_EMAIL_NOTIFICATION: 'testfarmer@ukr.net',
    REG_EXPS: {
        URL_STRING_DATE: /([0-9]{4})-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/ //yyyy-MM-DD
    },

    URL_APIS: {
        PLANTS_URL: {
            API_URL: 'https://www.kimonolabs.com/api/4fv5re1i?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',
            SOURCE: 'http://plants.moonsitesoftware.co.il/index.aspx'
        },
        MOAG_URL: {
            API_URL: 'https://www.kimonolabs.com/api/341qt4hq?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',
            SOURCE: 'http://www.prices.moag.gov.il/prices/veg_1.htm'
        }
    },

    CSV_FILES: {
        VEGETABLES_WITH_PRICES_2013: 'csv/veg_prices_2013.csv',
        VEGETABLES_WITH_PRICES_2014: 'csv/veg_prices_2014.csv'
    },

    MODELS: {
        ADMIN: 'Admin',
        USER: 'User',
        PLANT: 'Plant',
        SESSION: 'Session',
        IMAGE: 'Image'
    },
    ALPHABETICAL_FOR_TOKEN: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
};