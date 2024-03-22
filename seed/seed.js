const mongoose = require('mongoose');
const { JournalEntry } = require('../models/journal')// Assuming your model is defined in a separate file
const { Gym } = require('../models/gym')

mongoose.connect('mongodb://127.0.0.1:27017/fitfinity')
  .then(() => console.log('Connected!'));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Sample data to insert
// const sampleJournalEntries = [
//     {
//         author: '6158f52d96cb291b56b0a497', // Assuming this is a valid ObjectId for an existing user
//         title: 'First Entry',
//         content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//         images: [
//             { url: 'https://example.com/image1.jpg', filename: 'image1.jpg' },
//             { url: 'https://example.com/image2.jpg', filename: 'image2.jpg' }
//         ],
//         createdAt: new Date('2024-03-17T12:00:00Z')
//     },
//     {
//         author: '6158f52d96cb291b56b0a497',
//         title: 'Second Entry',
//         content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
//         images: [
//             { url: 'https://example.com/image3.jpg', filename: 'image3.jpg' },
//             { url: 'https://example.com/image4.jpg', filename: 'image4.jpg' }
//         ],
//         createdAt: new Date('2024-03-18T12:00:00Z')
//     }
// ];

// // Insert sample data
// JournalEntry.insertMany(sampleJournalEntries)
//     .then(docs => {
//         console.log('Sample data inserted successfully:', docs);
//     })
//     .catch(err => {
//         console.error('Error inserting sample data:', err);
//     });


const gymEntry = [
  {
    title: "Fitness Plus",
    description: "State-of-the-art gym with modern equipment",
    location: "Cityville, USA",
    price: 50,
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', filename: "image1.jpg" },
    ],
    geometry: { type: 'Point', coordinates: [139.1485991, 35.76478424] },
    reviews: [], // Assuming there are no reviews yet
    author: "6158f52d96cb291b56b0a497"
  },
  {
    title: "Iron Gym",
    description: "Hardcore gym for serious lifters",
    location: "Townsville, Canada",
    price: 70,
    images: [
      { url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', filename: 'image2.jpg' }
    ],
    reviews: [], // Assuming there are existing review IDs
    geometry: { type: 'Point', coordinates: [139.1485991, 35.76478424] },
    author: "6158f52d96cb291b56b0a497"
  },
  // Add more entries as needed
];

Gym.deleteMany()
  .then(() => console.log("Deleted!"))
  .catch((err) => console.log("ran into error", err))
Gym.insertMany(gymEntry)
  .then(() => console.log("done"))
  .catch((err) => console.log("ran into error", err))

