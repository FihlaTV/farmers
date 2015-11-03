module.exports = {
    FARMER_EMAIL_NOTIFICATION: 'testfarmer@ukr.net',
    REG_EXPS: {
        URL_STRING_DATE: /([0-9]{4})-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/ //yyyy-MM-DD
    },

    WHOLE_SALE_MARKET: 'Wholesale',
    PLANT_COUNCIL: 'PlantCouncil',

    URL_APIS: {
        PLANTS_URL: {
            //API_URL: 'https://www.kimonolabs.com/api/4fv5re1i?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',   // old API KEY by Ivan Kornik
             API_URL: 'https://www.kimonolabs.com/api/azwrvkw8?apikey=iixRhkE8EfnDKY6LfiqLl4y4JNb8ymeh', // full api key by Mor Bad: get old prices, after site updating
            //API_URL: 'https://www.kimonolabs.com/api/ondemand/azwrvkw8',
            SOURCE: 'http://plants.moonsitesoftware.co.il/index.aspx'
        },
        MOAG_URL: {
            API_URL: 'https://www.kimonolabs.com/api/341qt4hq?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',
            API_URL_1: 'https://www.kimonolabs.com/api/341qt4hq?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',
            API_URL_2: 'https://www.kimonolabs.com/api/341qt4hq?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',
            API_URL_3: 'https://www.kimonolabs.com/api/341qt4hq?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4',
            SOURCE_1: 'http://www.prices.moag.gov.il/prices/veg_1.htm',
            SOURCE_2: 'http://www.prices.moag.gov.il/prices/fruit_1.htm',
            SOURCE_3: 'http://www.prices.moag.gov.il/prices/citr_1.htm'
        }
    },

    CSV_FILES: {
        VEGETABLES_WITH_PRICES_2013: 'csv/veg_prices_2013.csv',
        VEGETABLES_WITH_PRICES_2014: 'csv/veg_prices_2014.csv',
        MARKETEER: 'csv/marketeers.csv',
        CROP_LIST: 'csv/cropList.csv'
    },

    MODELS: {
        ADMIN: 'Admin',
        USER: 'User',
        MARKETEER: 'Marketeer',
        NOTIFICATION: 'Notification',
        PLANT: 'Plant',
        PRICE: 'Price',
        MONTH_AVERAGE_PRICE: 'MonthAveragePrice',
        CROP: 'Crop',
        SESSION: 'Session',
        IMAGE: 'Image',
        //TODO it need  to detect and fix server crash when not JSON data received, and parse crash. Delete this in future
        PARSED_BODY: 'ParsedBody'
    },

    ALPHABETICAL_FOR_TOKEN: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',

    DEFAULT_ADMIN: {
        login: 'defaultAdmin',
        email: 'smsspam@ukr.net'
        //email pass: smsspam
        //pass: 'farmersAdmin'
    }
};