const express = require('express');
const router = express.Router();
const { accounts } = require('../database/database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

router.post('/loadData', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username not provided' });
        }

        const user = await accounts.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.DOB instanceof Date) {
            user.DOB = user.DOB.toISOString().split('T')[0];
        } else {
            user.DOB = '';
        }

        const profilePhoto = user.profilePhoto;
        user.profilePhoto = profilePhoto ? `https://g02bq8d9-3000.inc1.devtunnels.ms/${profilePhoto}` : '';

        return res.status(200).json({ status: 'success', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to load profile data' });
    }
});

router.post('/removeFriend', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        if (!userId&& !friendId) {
            return res.status(400).json({ message: 'User ID not provided' });
        }

        const user = await accounts.findOne({ username: userId });
        const friend = await accounts.findOne({ username: friendId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedFriends = user.friends.filter(friend => friend !== friend._id);

        await accounts.updateOne({ username: userId }, { $set: { friends: updatedFriends } });

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove friend' });
    }
});

router.post('/checkFriend', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        if (!userId || !friendId) {
            return res.status(400).json({ message: 'User ID or Friend ID not provided' });
        }

        const user = await accounts.findOne({ username: userId });
        const friend = await accounts.findOne({ username: friendId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFriend = user.friends.includes(friend._id);

        if (isFriend) {
            return res.status(200).json({ status: 'success', message: 'Friend found' });
        } else {
            return res.status(200).json({ status: 'success', message: 'Friend not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to check Friend' });
    }
});






router.get('/Edit/:username', async (req, res) => {
    const { username } = req.params;

    const sessionToken = req.cookies.sessionToken;

    try {
        const user = await accounts.findOne({ username, session: sessionToken });

        if (user) {
            res.render('profileEdit', { username: username });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);

        res.status(500).json({ message: 'Authentication failed' });
    }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const profileName = req.body.username;
        const uploadDir = path.join(__dirname, '../profilePhotos', profileName);

        fs.mkdir(uploadDir, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating repository directory:', err);
                cb(err, null);
            } else {
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// update-profile
router.post('/update-profile', upload.single('profilePhoto'), async (req, res) => {
    try {
        const {
            username,
            firstName,
            lastName,
            gender,
            DOB,
            email,
            region,
            bio,
        } = req.body;

        const user = await accounts.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profilePhoto = req.file;

        const originalname = req.body.username;
        const photoDirectory = path.join(__dirname, '../profilePhotos', originalname);

        user.First_name = firstName;
        user.Last_name = lastName;
        user.gender = gender;
        user.DOB = DOB;
        user.email = email;
        user.region = region;
        user.bio = bio;

        if (profilePhoto) {
            const filePath = path.join(photoDirectory, profilePhoto.originalname);
            fs.renameSync(profilePhoto.path, filePath);
            user.profilePhoto = `/profilePhotos/${originalname}/${profilePhoto.originalname}`;
        }

        await fs.promises.mkdir(photoDirectory, { recursive: true });

        await user.save();

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Profile update failed' });
    }
});





module.exports = router;
