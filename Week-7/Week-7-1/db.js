const mongoose = require("mongoose");

const connectionURL = "mongodb://localhost:27017/week-7-1";

mongoose
  .connect(connectionURL)
  .then(() => {
    console.log("Connection Established ");
  })
  .catch((err) => {
    console.log("Can't Established the connection ");
  });

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  password: String,
});

const todosSchema = new mongoose.Schema({
  title: String,
  description: String,
  isCompleted: Boolean,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const User = mongoose.model("User", userSchema);
const Todos = mongoose.model("Todos", todosSchema);

module.exports = {
  User,
  Todos,
};
