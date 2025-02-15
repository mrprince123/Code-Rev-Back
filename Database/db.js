const mongoose = require("mongoose");

const connectDatabase = () => {
  try {
    const url = process.env.DATABASE;
    mongoose.connect(url);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database Connection Failed ", error);
  }
};

module.exports = connectDatabase;
