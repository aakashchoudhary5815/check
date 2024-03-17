const { Router } = require("express"); // Import the Router from the Express library

const {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
} = require("../controllers/userControllers"); // Import user-related controller functions
const authMiddleware = require("../middleware/authMiddleware"); // Import authentication middleware

const router = Router(); // Create an Express router object

// **User Routes:**

// - Register a new user
router.post("/register", registerUser);

// - Log in a user
router.post("/login", loginUser);

// - Get a specific user by ID
router.get("/:id", getUser);

// - Get all users (authors)
router.get("/", getAuthors);

// **Auth-protected Routes:**

// - Change a user's avatar (requires authentication)
router.post("/change-avatar", authMiddleware, changeAvatar);

// - Edit a user's profile (requires authentication)
router.patch("/edit-user", authMiddleware, editUser);

module.exports = router; // Export the router object
