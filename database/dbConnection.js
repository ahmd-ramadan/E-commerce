const mongoose = require('mongoose');

module.exports.mongoConection = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => { 
        console.log("Database is running ..")
    })
    .catch((err) => {
        console.log("DataBase error", err)
    });
}

