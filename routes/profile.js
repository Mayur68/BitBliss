const express = require("express");
const router = express.Router();
const { accounts } = require("../database/database");

router.get('/loadData', async (req, res) => {
    try {
        const { username } = req.query;
        const user = await accounts.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.DOB && user.DOB instanceof Date) {
            user.DOB = user.DOB.toISOString().split('T')[0];
        } else {
            user.DOB = "";
        }

        return res.status(200).json({ status: "success", user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to load profile data' });
    }
});

router.get("/Edit/:username", async (req, res) => {
    const { username } = req.params;
    res.render("profileEdit", { username: username });
});

// update-profile
router.post('/update-profile', async (req, res) => {
    try {
        const {
            username,
            First_name,
            Last_name,
            gender,
            DOB,
            email,
            region,
            password,
            bio,
        } = req.body;


        const user = await accounts.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.First_name = First_name;
        user.Last_name = Last_name;
        user.gender = gender;
        user.DOB = DOB;
        user.email = email;
        user.region = region;
        user.password = password;
        user.bio = bio;

        await user.save();

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Profile update failed' });
    }
});


module.exports = router;