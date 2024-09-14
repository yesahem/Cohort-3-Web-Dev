const express = require("express");
const bcrypt = require("bcrypt");
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

// Salting and hasing generic normal user given passwords

async function generateHashing(nonHashedPassword) {
  const hash = await bcrypt.hash(nonHashedPassword, 12);
  return hash;
}

async function isValidHash(hashedPassword, hash) {
  const result = await bcrypt.compare(hashedPassword, hash);
  return result;
  // if matches ==> true
  // if dontMatch ==> false
}
// creating user and returning JWt
app.post("/signup", async (req, res) => {
  try {
    const body = req.body;

    // console.log(`bodyPassword ${body.password}`);

    //    const finalPassword = await bcrypt.hash(body.password, 2);
    const finalPassword = await generateHashing(body.password);
    console.log(`Final Passsword is ${finalPassword}`);

    // console.log(`hashed password is ${body.password}`);

    await User.create({
      name: body.name,
      age: body.age,
      email: body.email,
      password: finalPassword,
    }).then((isDataStored) => {
      console.log(`Is data stored: ${isDataStored}`);
      const token = jwt.sign(isDataStored.id, jwtPrivateKey);
      console.log(`Token is :${token}`);

      return res.json({
        messge: "User Created Sucessfully :)",
      });
    });
  } catch (err) {
    if (err.errorResponse.code == 11000) {
      return res.status(403).json({
        messge: "Email already exists",
      });
    }
    // console.log(`Error while Signup is ${err}`);
    return res.status(403).json({
      messge: "Something went wrong",
    });
  }
});

// Validates user login
app.post("/signin", async (req, res) => {
  const body = req.body;

  const doesUserExists = await User.findOne({
    email: body.email,
    // password: finalPassword,
  });

  console.log(doesUserExists);
  const isValidPassword = await isValidHash(
    body.password,
    doesUserExists.password,
  );
  console.log(`isValidPassword value is ${isValidPassword}`);
  if (isValidPassword) {
    const token = jwt.sign(doesUserExists.id, jwtPrivateKey);
    console.log(token);

    return res.json({
      token: token,
    });
  }
  return res.status(401).json({
    messge: "Unauthorised",
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
