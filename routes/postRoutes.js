// const { Router } = require("express"); // Import Router from Express
// const {
//   createPost,
//   getPosts,
//   getPost,
//   getCatPosts,
//   getUserPosts,
//   editPost,
//   deletePost,
// } = require("../controllers/postController"); // Import post controller functions
// const authMiddleware = require("../middleware/authMiddleware"); // Import authentication middleware

// const router = Router(); // Create an Express router object

// // **Post Routes:**

// // - Create a new post (requires authentication)
// router.post("/", authMiddleware, createPost);

// // - Get all posts
// router.get("/", getPosts);

// // - Get a single post by ID
// router.get("/:id", getPost);

// // - Get posts filtered by category
// router.get("/categories/:category", getCatPosts);

// // - Get posts for a specific user
// router.get("/users/:id", getUserPosts);

// // **Auth-protected Routes:**

// // - Edit a post (requires authentication)
// router.patch("/:id", authMiddleware, editPost);

// // - Delete a post (requires authentication)
// router.delete("/:id", authMiddleware, deletePost);

// module.exports = router; // Export the router object

const { Router } = require("express");
const {
  createPost,
  getPosts,
  getPost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/categories/:category", getCatPosts);
router.get("/users/:id", getUserPosts);
router.patch("/:id", authMiddleware, editPost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
