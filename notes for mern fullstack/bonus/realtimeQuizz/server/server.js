import dbConnect from './db'

// sets up the connection for development, production and avoid testing to interfere with them

var databaseURL = ""
switch (process.env.NODE_ENV.toLowerCase()) {
    case "development":
        databaseURL = `mongodb://localhost:27017/${process.env.npm_package_name}-${process.env.NODE_ENV.toLowerCase()}`
        break
    case "production":
        databaseURL = process.env.ATLAS_DB_URL;
        break
    default:
        console.error("server.js will not connect to the database in the current NODE_ENV.");
        break
}

if (process.env.NODE_ENV != 'test'){
    dbConnect(databaseURL).then(() => {
        console.log("Database connected successfully!");
    }).catch(error => {
        console.log(`
        Some error occurred connecting to the database! It was: 
        ${error}
        `);
    });
}