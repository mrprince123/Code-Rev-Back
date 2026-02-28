const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const url = process.env.DATABASE;
    await mongoose.connect(url);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database Connection Failed ", error);
    throw error;
  }
};

module.exports = connectDatabase;
