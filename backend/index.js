const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config.json');
const mongoose = require('mongoose');
const { authenticateToken } = require('./utilities');
const upload = require("./multer");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const User = require('./models/user.model');
const TravelStory = require('./models/travelStory.model');
const { error } = require('console');


mongoose.connect(config.connectionString).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});


const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173', // specify your frontend's URL
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  
app.use(cors(corsOptions));

// Create Account
app.post("/create-account", async (req, res) => {
    console.log(req.body);
  
    const { fullName, email, password } = req.body;
  
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({
          error: true,
          message: "All fields are required",
        });
    }
  
    const isUser = await User.findOne({ email });
  
    if (isUser) {
      return res
        .status(400)
        .json({
          error: true,
          message: "User with this email already exists",
        });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        fullName,
        email,
        password: hashedPassword,
      });
  
      await user.save();
  
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
  
      return res
        .status(200)
        .json({
          error: false,
          user: {
            fullName: user.fullName,
            email: user.email,
          },
          accessToken,
          message: "User created successfully",
        });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          error: true,
          message: "Error creating account",
        });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
    return res
    .status(400)
    .json({
        error: true, message: "All fields are required"
    });

    const user = await User.findOne({ email });
    if (!user) {
        return res
        .status(400)
        .json({
            error: true, message: "User with this email does not exist" 
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res
        .status(400)
        .json({
            error: true, message: "Invalid Credentials"
        });
    }

    const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );

    return res
    .status(200)
    .json({
        error: false,
        user: {
            fullName: user.fullName,
            email: user.email
        },
        accessToken,
        message: "User logged in successfully"
    });
});

// Get User
app.get("/get-user", authenticateToken,async (req, res) => {
    const { userId } = req.user;
    const isUser = await User.findById({_id: userId});
    if (!isUser) {
        return res
        .sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: "User fetched successfully"
    });
});

// Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;
    if (!title || !story || !imageUrl || !visitedLocation || !visitedDate) {
        return res
        .status(400)
        .json({
            error: true, message: "All fields are required"
        });
    }

    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try{
        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            imageUrl,
            visitedDate: parsedVisitedDate,
            userId,
        });

        await travelStory.save();
        res.status(201).json({ story: travelStory, message: "Travel story added successfully" });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

// Get All Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
    console.log("Getting all stories...");
    const { userId } = req.user;
    console.log(`User ID: ${userId}`);
    try {
      const travelStories = await TravelStory.find({ userId: userId }).sort({ isFavourite: -1 });
      console.log(`Stories: ${travelStories}`);
      res.status(200).json({ stories: travelStories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: true, message: error.message });
    }
  });

// Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res
            .status(400)
            .json({ error: true, message: "No file uploaded" });
        }
        
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: error.message });
    }
})

// Delete Travel Story
app.delete("/delete-image", authenticateToken, async (req, res) => {
    const { imageUrl } = req.query;
    if (!imageUrl) {
        return res
        .status(400)
        .json({ error: true, message: "Image URL is required" });
    }

    try {
        // Extract the filename from the URL
        const filename = path.basename(imageUrl);

        // Define the file path
        const filePath = path.join(__dirname, "uploads", filename);

        // Check if the file exists
        if (fs.existsSync(filePath)){
            // Delete the file
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: true, message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
        }
});

//Serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;
    if (!title || !story || !visitedLocation || !visitedDate) {
        return res
        .status(400)
        .json({
            error: true, message: "All fields are required"
        });
    }
    // Convert visited date from milliseconds to Date object
    const parsedVisitedDate = new Date(parseInt(visitedDate));

    try{
        // Find the travel story by ID and ensure it belongs to the authenticated user
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            return res
            .status(404)
            .json({ error: true, message: "Travel story not found" });
        }

        const placeholderImageUrl = `http://localhost:5000/assets/placeholder.jpg`;

        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocation = visitedLocation;
        travelStory.imageUrl = imageUrl || placeholderImageUrl;
        travelStory.visitedDate = parsedVisitedDate;

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Travel story updated successfully" });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

// Delete Travel Story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    try {
      const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
      if (!travelStory) {
        return res
          .status(404)
          .json({ error: true, message: "Travel story not found" });
      }
      await travelStory.deleteOne({ _id: id, userId: userId });
  
      // Extract the filename from the imageUrl
      const imageUrl = travelStory.imageUrl;
      const filename = path.basename(imageUrl);
  
      const filePath = path.join(__dirname, "uploads", filename);
      console.log(`File path: ${filePath}`);
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.access(filePath);
          console.log(`File deleted: ${filePath}`);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: true, message: err.message });
        }
      } else {
        console.log(`File not found: ${filePath}`);
      }
  
      res.status(200).json({ message: "Travel story deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  });

// Update is Favourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { isFavourite } = req.body;
    const { userId } = req.user;
    try {
      const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
      if (!travelStory) {
        return res
          .status(404)
          .json({ error: true, message: "Travel story not found" });
      }
      travelStory.isFavourite = isFavourite;
      await travelStory.save();
      res.status(200).json({ message: "Travel story updated successfully" });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
});

// Search Travel Stories
app.get("/search", authenticateToken, async (req, res) => {
    const { query } = req.query;
    const { userId } = req.user;

    if (!query) {
      return res
        .status(400)
        .json({ error: true, message: "Query is required" });
    }


    try {
      const searchResults = await TravelStory.find({
        userId: userId,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { story: { $regex: query, $options: "i" } },
          { visitedLocation: { $regex: query, $options: "i" } },
        ],
      }).sort({ isFavourite: -1 });

      res.status(200).json({ stories: searchResults });
    } catch (error) {
      res.status(500).json({ error: true, message: error.message });
    }
  });

// Filter travel stories by date range
// app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
//     const { startDate, endDate } = req.query;
//     const { userId } = req.user;

//     try{
//         // Convert startDate and endDATE from milliseconds to Date objects
//         const start = new Date(parseInt(startDate));
//         const end = new Date(parseInt(endDate));

//         // Find travel stories that belong to the authenticated user and fall within the date range
//         const filterStories = await TravelStory.find({
//             userId: userId,
//             visitedDate: { $gte: start, $lte: end }, 
//         }).sort({ isFavourite: -1 });

//         res.status(200).json({stories: filteredStories});
//     }catch(error){
//         res.status(500).json({ error: true, message: error.message });
//     }
// });

// Filter travel stories by date range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  try{
      // Convert startDate and endDATE from milliseconds to Date objects
      const start = new Date(parseInt(startDate));
      const end = new Date(parseInt(endDate));

      // Find travel stories that belong to the authenticated user and fall within the date range
      const filterStories = await TravelStory.find({
          userId: userId,
          visitedDate: { $gte: start, $lte: end }, 
      }).sort({ isFavourite: -1 });

      res.status(200).json({stories: filterStories});
  }catch(error){
      console.error(error); // Add this line to log the error message
      res.status(500).json({ error: true, message: error.message });
  }
});


    
app.listen(5000)
module.exports = app;
