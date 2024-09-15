const mongoose = require("mongoose");

url = "http://localhost:27017/week-7-2";

mongoose.connect(url).then(() => {
  console.log("Connection establishes with database at week-7-2");
});
