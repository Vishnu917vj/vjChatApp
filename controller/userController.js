const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const bcrypt = require('bcryptjs');

// Helper function to hash the password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the generated salt
    return hashedPassword;
};

// Helper function to check the password
const checkPassword = async (password1, password2) => {
    return bcrypt.compare(password1, password2);
};

const registerUser = async (req, res) => {
    const { name, email, password, pic } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Invalid credentials, all fields are required." });
    }

    try {
        // Check if the user already exists
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before storing in the database
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const user = await User.create({
            username: name,
            email: email,
            password: hashedPassword,
            profilePicture: pic,
        });

        // Check if the user creation was successful
        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.username,
                email: user.email,
                pic: user.profilePicture,
                token: generateToken(user._id),
            });
        } else {
            return res.status(400).json({ message: "Cannot create user" });
        }
    } catch (error) {
        // Catch any errors and send a response
        return res.status(500).json({ message: error.message });
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
        return res.status(400).json({ message: "Please enter valid credentials" });
    }

    try {
        // Check if the user exists
        const userExist = await User.findOne({ email: email });
        if (!userExist) {
            // User not found
            return res.status(400).json({ message: "Please register first, cannot find any account" });
        }

        // Check if the password is correct
        const isPasswordCorrect = await checkPassword(password, userExist.password);
        if (!isPasswordCorrect) {
            // Incorrect password
            return res.status(400).json({ message: "Password incorrect" });
        }

        // Successful login, send user info and token
        console.log("Successful login");
        return res.status(201).json({
            message: "Login successful",
            user: {
                _id: userExist._id,
                name: userExist.username,
                email: userExist.email,
                pic: userExist.profilePicture,
                token: generateToken(userExist._id),
            }, // Send token for further authentication
        });
    } catch (error) {
        // Catch any errors and send a response
        return res.status(500).json({ message: error.message });
    }
};
const allUser = async (req, res) => {
    try {
      const keyword = req.query.search
        ? {
            $or: [
              { username: { $regex: req.query.search, $options: 'i' } },
              { email: { $regex: req.query.search, $options: 'i' } },
            ],
          }
        : {};
  
      // Use a single find query, excluding the current user (_id not equal to req.user._id)
      const users = await User.find({
        ...keyword,
        _id: { $ne: req.user._id }, // Exclude the logged-in user
      });
  
      res.status(200).json(users); // Send the found users as JSON response
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  const UpdateProfilePic = async (req, res) => {
    const { pic } = req.body; // Assuming the new picture URL is sent in the body
    const userId = req.user._id;

    try {
        // Find the user and update the profile picture
        const user = await User.findByIdAndUpdate(userId, { profilePicture: pic }, { new: true });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            pic: user.profilePicture,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  
const UpdateUsername = async (req, res) => {
    const { name } = req.body; // Assuming the new picture URL is sent in the body
    const userId = req.user._id;

    try {
        // Find the user and update the profile picture
        const user = await User.findByIdAndUpdate(userId, { username: name }, { new: true });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            pic: user.profilePicture,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser,allUser ,UpdateProfilePic,UpdateUsername};
