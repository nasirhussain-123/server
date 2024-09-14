const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = 5001;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection setup
const mongoURI = process.env.MONGODB_URI;
let db;

// Connect to MongoDB
MongoClient.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to Database");
    db = client.db(); // use default database in the connection string
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Routes

// Create a new document in the collection
app.post("/client-signup", async (req, res) => {
  try {
    const { name, email, phone, password, roles } = req.body;

    // Check if all required fields are present
    if (!name || !email || !phone || !password || !roles) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Access the collection from the database
    const collection = db.collection("users");

    // Check if the email already exists
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use." });
    }

    // Prepare user object to insert
    const newUser = {
      name,
      email,
      phone,
      password, // In a real-world scenario, password should be hashed
      roles, // 'roles' could be an array or a string based on your needs
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the user into the collection
    const result = await collection.insertOne(newUser);

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      userId: result.insertedId,
    });
  } catch (err) {
    // Handle any errors
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/dietician-signup", async (req, res) => {
  try {
    const { name, email, phone, password, roles } = req.body;

    // Check if all required fields are present
    if (!name || !email || !phone || !password || !roles) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Ensure that the role is 'dietician'
    if (roles !== "dietician") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid role. Only 'dietician' is allowed.",
        });
    }

    // Access the collection from the database
    const collection = db.collection("users");

    // Check if the email already exists
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use." });
    }

    // Prepare the user object to insert
    const newDietician = {
      name,
      email,
      phone,
      password, // In a real-world scenario, password should be hashed
      roles, // Should be 'dietician'
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the dietician into the collection
    const result = await collection.insertOne(newDietician);

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "Dietician registered successfully.",
      userId: result.insertedId,
    });
  } catch (err) {
    // Handle any errors
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/admin-signup", async (req, res) => {
    try {
      const { name, email, phone, password, roles } = req.body;
  
      // Check if all required fields are present
      if (!name || !email || !phone || !password || !roles) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
  
      // Ensure that the role is 'admin'
      if (roles !== "admin") {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid role. Only 'admin' is allowed.",
          });
      }
  
      // Access the collection from the database
      const collection = db.collection("users");
  
      // Check if the email already exists
      const existingUser = await collection.findOne({ email: email });
      if (existingUser) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use." });
      }
  
      // Prepare the user object to insert
      const newAdmin = {
        name,
        email,
        phone,
        password, // In a real-world scenario, password should be hashed
        roles, // Should be 'admin'
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      // Insert the admin into the collection
      const result = await collection.insertOne(newAdmin);
  
      // Respond with success message
      res.status(201).json({
        success: true,
        message: "Admin registered successfully.",
        userId: result.insertedId,
      });
    } catch (err) {
      // Handle any errors
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });
  
app.post('/login', async (req, res) => {
    try {
      const { email, password, roles } = req.body;
  
      // Check if all required fields are present
      if (!email || !password || !roles) {
        return res.status(400).json({ success: false, message: "Email, password, and roles are required." });
      }
  
      // Access the collection from the database
      const collection = db.collection('users');
  
      // Find user with matching email and role
      const user = await collection.findOne({ email: email, roles: roles });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Check if the password matches
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Incorrect password." });
      }
  
      // Send success response based on role
      if (roles === 'dietician') {
        return res.status(200).json({
          success: true,
          message: "Dietician logged in successfully.",
          userData: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          }
        });
      } else if (roles === 'client') {
        return res.status(200).json({
          success: true,
          message: "Client logged in successfully.",
          userData: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          }
        });
      } else if (roles === 'admin') {
        return res.status(200).json({
          success: true,
          message: "Admin logged in successfully.",
          userData: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          }
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid role." });
      }
  
    } catch (err) {
      // Handle any errors
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
  



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
