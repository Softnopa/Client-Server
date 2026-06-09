const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "your_super_secret_learning_key_123";

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors()); // Enables Cross-Origin Resource Sharing so frontend apps can talk to this API
app.use(express.json()); // Parses incoming requests with JSON payloads

// ==========================================
// 2. IN-MEMORY DATABASE (Seeded for testing)
// ==========================================
const users = [];
const todos = [];

// Seed a default user asynchronously so students can log in immediately
(async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  users.push({
    id: "user_" + Date.now(),
    username: "admin",
    password: hashedPassword,
  });
  console.log("💡 Database Seeded: Default user available (admin / admin123)");
})();

// ==========================================
// 3. AUTHENTICATION MIDDLEWARE (The Guard)
// ==========================================
/**
 * Middleware to protect routes. It intercepts requests, checks for a valid JWT
 * in the Authorization header, and injects the user payload into the request object.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // Expected format: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided!" });
  }

  try {
    const verifiedUser = jwt.verify(token, JWT_SECRET);
    req.user = verifiedUser; // Attach the user payload (id, username) to the request
    next(); // Pass control to the next route handler
  } catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Token!" });
  }
}

// ==========================================
// 4. AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Check if user already exists
    const userExists = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (userExists) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = {
      id: "user_" + Date.now(),
      username,
      password: hashedPassword,
    };
    users.push(newUser);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generate JWT (Expires in 1 hour)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Return token and basic user info to the frontend
    res.status(200).json({
      message: "Login successful!",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ==========================================
// 5. PROTECTED TODO ROUTES (Using Middleware)
// ==========================================

// GET /api/todos - Fetch todos ONLY for the logged-in user
app.get("/api/todos", authenticateToken, (req, res) => {
  try {
    // Filter todos where the userId matches the logged-in user's ID from the JWT
    const userTodos = todos.filter((t) => t.userId === req.user.id);
    res.status(200).json(userTodos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos." });
  }
});

// POST /api/todos - Create a todo bound to the logged-in user
app.post("/api/todos", authenticateToken, (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Todo title is required." });
    }

    const newTodo = {
      id: "todo_" + Date.now(),
      userId: req.user.id, // Linked to the authenticated user
      title,
      completed: false,
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: "Failed to create todo." });
  }
});

// ==========================================
// 6. SERVER STARTUP
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
