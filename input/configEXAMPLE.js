module.exports = {

    // Launch scheduler, settings for daily task execution 
    scheduler: {
        // everyday - if true, data collection is performed daily at a fixed time;
        // if false, the collection occurs at a random time during the day.
        everyday: false,

        // fixed_time - specify a fixed time for daily collection in 24-hour format, e.g., "14:00", if everyday is true.
        fixed_time: "12:00",

        // start_date - the start date and time for initiating daily collection, in the format "DD.MM.YY-HH:MM".
        // Leave it as an empty string if you want to start the task immediately.
        start_date: "",

        // max_time - the maximum duration (in minutes) during which the data collection will run
        max_time: 60, 

        // utc_offset - time zone offset from UTC in hours (e.g., +4 for UTC+4, -3 for UTC-3)
        utc_offset: 7, 

        // Convert max_time into millisecondsd
        get max_time_in_ms() {
            return this.max_time * 60 * 1000;  
        }
    },

    // Decryption of imported data
    decryption: {
        // decrypt - if true, the imported data is considered encrypted and needs decryption;
        // if false, the data is considered unencrypted.
        decrypt: false,
        
        // message - the passphrase used for decrypting the data
        message: "Sup, bro"
    },

    mongoDB: {
        use: true,
        URI: "mongodb+srv://USERMANE:PASSWORD@cock.XXXX.mongodb.net/?retryWrites=true&w=majority&appName=NAME",
        project_name: "Morph"
    },

    TGbot: {
        token: "1241241412412412412412412412414",
        allowedUsers: [1231231313]
    },

    POLYGON_RPC_URL: "https://polygon-rpc.com",

    CONTRACT: "0xBAB028f7ac84EB4A90BC4eE5c3725437fFbA806e"
};