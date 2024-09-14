const express = require("express");
const { Todos, User } = require("./db");
const jwt = require("jsonwebtoken");
const jwtPrivateKey = "100xDevs";
const app = express();

const port = 3000;
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    messge: "Let's see it connection establishes",
  });
});

// creating user and returning JWt
app.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    const isDataStored = await User.create({
      name: body.name,
      age: body.age,
      email: body.email,
      password: body.password,
    });
    console.log(`Is data stored: ${isDataStored}`);
    const token = jwt.sign(isDataStored.id, jwtPrivateKey);
    console.log(`Token is :${token}`);

    return res.json({
      messge: "User Created Sucessfully :)",
    });
  } catch (err) {
    console.log(`Error while Signup is ${err}`);
    return res.json({
      messge: "Something went wrong",
    });
  }
});

// Validates user login
app.post("/signin", async (req, res) => {
  const body = req.body;
  const doesUserExists = await User.findOne({
    name: body.name,
    password: body.password,
  });
  console.log(doesUserExists);

  if (doesUserExists) {
    const token = jwt.sign(doesUserExists.id, jwtPrivateKey);
    console.log(token);

    return res.json({
      token: token,
    });
  }
  return res.json({
    messge: "oops no user found with the given input",
  });
});

// only valid users can create todos
app.post("/todo", async (req, res) => {
  const token = req.headers.token;
  const body = req.body;

  const isValidUser = jwt.verify(token, jwtPrivateKey);
  console.log(isValidUser);
  if (isValidUser) {
    const addTodo = await Todos.create({
      title: body.title,
      description: body.description,
      isCompleted: body.isCompleted,
    });
    const userId = addTodo._id;
    console.log(`Your user id id ${userId}`);
    console.log(`Todo added is ${addTodo}`);
    return res.json({
      messge: "Todos Added Sucessfully :)",
    });
  } else {
    console.log(`Valid User ${isValidUser}`);

    return res.json({
      messge: "User Not Valid",
    });
  }
});

// anyone can see the list of todos (non-authenicated routes)
app.get("/todos", async (req, res) => {
  const token = req.headers.token;
  const decodedToken = jwt.verify(token, jwtPrivateKey);
  console.log(decodedToken);
  const todos = await Todos.find({
    id: decodedToken.id,
  });

  console.log(todos);
  console.log(`Length of todos ${todos.length}`);

  return res.json({
    todos: todos,
  });
});

app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
