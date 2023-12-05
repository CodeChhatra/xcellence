// user.js

const express = require('express');
const { connectDB } = require('./db');
const client = require('./db');


const router = express.Router();

function calculateAge(dateOfBirth, currentDate) {
  const dob = new Date(dateOfBirth);
  const ageDate = new Date(currentDate - dob);
  const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
  return isNaN(calculatedAge) ? null : calculatedAge;
}

// Function to insert data into the database
async function connectAndInsertData() {
    try {
      await client.connect();
      console.log('Connected to MongoDB!');
  
      const db = client.db('test');
      const usersCollection = db.collection('Users');
      const userProfileCollection = db.collection('UsersProfile');
  
      
      const existingUsersData = await usersCollection.find({}).toArray();
      const existingUserProfileData = await userProfileCollection.find({}).toArray();
  
      // Call the function to insert existing data
      await insertExistingData(usersCollection, existingUsersData);
      await insertExistingData(userProfileCollection, existingUserProfileData);
  
      console.log('Data inserted successfully.');
    } catch (err) {
      console.error('Error inserting data:', err);
      console.error(err.stack);
    } finally {
      await client.close();
      console.log('Connection closed.');
    }
  }
  
  
  async function insertExistingData(collection, data) {
    await collection.insertMany(data);
  }

router.get('/calculateAndUpdateAge', async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection('UsersProfile');

    const users = await usersCollection.find({}).toArray();

    const currentDate = new Date();
    let totalAge = 0;
    let validUsersCount = 0;

    for (const user of users) {
      try {
        const dob = new Date(user.dob);
        const age = calculateAge(dob, currentDate);

        if (!isNaN(age)) {
          totalAge += age;
          validUsersCount++;

          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { age: age } }
          );
        }
      } catch (error) {
        console.error(`Error calculating age for user ${user.name}: ${error}`);
      }
    }

    const averageAge = totalAge / validUsersCount;

    res.json({ averageAge });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error calculating average age.' });
  }
});


router.get('/deleteUsers', async (req, res) => {
  try {
    const db = await connectDB();
    const userProfileCollection = db.collection('UsersProfile');
    const usersCollection = db.collection('Users');

    const ageThreshold = 25;

    const usersToDelete = await userProfileCollection.find({ age: { $gte: ageThreshold } }).toArray();

    const deleteProfileResult = await userProfileCollection.deleteMany({ age: { $gte: ageThreshold } });

    const userIdsToDelete = usersToDelete.map(user => user.userId);
    const deleteUserResult = await usersCollection.deleteMany({ _id: { $in: userIdsToDelete } });

    res.json({ deletedProfilesCount: deleteProfileResult.deletedCount, deletedUsersCount: deleteUserResult.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting users.' });
  }
});

// New route to perform insertion based on existing data
router.get('/insertExistingData', async (req, res) => {
  try {
    await connectAndInsertData();
    res.json({ message: 'Existing data inserted successfully!' });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Error inserting existing data.' });
  }
});

module.exports = router;

