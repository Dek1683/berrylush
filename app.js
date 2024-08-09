
///////////////////////////////////////////////// Date converted in indian standerd Time ///////////////////////////////////////////////
// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const connectDB = require('./db'); // Import the database connection
// const Order = require('./orderModel'); // Import the Mongoose model

// const app = express();

// // Middleware to parse JSON bodies
// app.use(bodyParser.json());

// app.use(cors({
//   origin: '*'
// }));

// // Connect to MongoDB
// connectDB();

// // Function to convert UTC to IST
// const convertToIST = (date) => {
//   const utcDate = new Date(date);
//   const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
//   return new Date(utcDate.getTime() + istOffset);
// };

// // Define a route to handle Shopify webhook notifications
// app.post('/webhooks/orders/create', async (req, res) => {
//   try {
//     const orderData = req.body; // This will contain the order data sent by Shopify
//     console.log('Received new order:', orderData);

//     // Convert created_at to IST before saving
//     const createdAtIST = convertToIST(orderData.created_at);

//     // Save the order data to MongoDB
//     const order = new Order({
//       orderId: orderData.id,
//       created_at: createdAtIST, // Store the date in IST
//       subtotal_price: orderData.subtotal_price,
//       // Add more fields as needed
//     });
//     await order.save();

//     res.sendStatus(200); // Respond to Shopify to acknowledge receipt
//   } catch (error) {
//     console.error('Error handling webhook:', error);
//     res.sendStatus(500);
//   }
// });

// // Define a route to get today's and yesterday's highest paid amount
// app.get('/highest-paid', async (req, res) => {
//   try {
//     const now = new Date();
//     const todayIST = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today's start in IST
//     const tomorrowIST = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Tomorrow's start in IST
//     const yesterdayIST = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // Yesterday's start in IST

//     const today = convertToIST(todayIST); // Convert today's start to IST
//     const tomorrow = convertToIST(tomorrowIST); // Convert tomorrow's start to IST
//     const yesterday = convertToIST(yesterdayIST); // Convert yesterday's start to IST

//     // Query for today's highest paid amount
//     const result = await Order.aggregate([
//       {
//         $match: {
//           created_at: {
//             $gte: today,
//             $lt: tomorrow,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           todayHighestPaid: { $max: '$subtotal_price' },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           todayHighestPaid: 1,
//         },
//       },
//     ]);

//     const todayHighestPaid = result.length > 0 ? result[0].todayHighestPaid : 0;

//     // Query for yesterday's highest paid amount
//     const resultYesterday = await Order.aggregate([
//       {
//         $match: {
//           created_at: {
//             $gte: yesterday,
//             $lt: today,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           yesterdayHighestPaid: { $max: '$subtotal_price' },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           yesterdayHighestPaid: 1,
//         },
//       },
//     ]);

//     const yesterdayHighestPaid = resultYesterday.length > 0 ? resultYesterday[0].yesterdayHighestPaid : 0;

//     res.json({ todayHighestPaid, yesterdayHighestPaid });
//   } catch (error) {
//     console.error('Error fetching highest paid amount:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Start the server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });



///////////////////////////////////////////////////////////////////////////

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db'); // Import the database connection
const Order = require('./orderModel'); // Import the Mongoose model

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.use(cors(
  {
    origin:'*'
  }
));

// Connect to MongoDB
connectDB();

// Define a route to handle Shopify webhook notifications
app.post('/webhooks/orders/create', async (req, res) => {
  try {
    const orderData = req.body; // This will contain the order data sent by Shopify
    console.log('Received new order:', orderData);
    
    // Save the order data to MongoDB
    const order = new Order({
      orderId: orderData.id,
      created_at: new Date(orderData.created_at),
      subtotal_price: orderData.subtotal_price,
      // Add more fields as needed
    });
    await order.save();

    res.sendStatus(200); // Respond to Shopify to acknowledge receipt
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.sendStatus(500);
  }
});

// Define a route to get today's and yesterday's highest paid amount
app.get('/highest-paid', async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Set yesterday's date

    // Query for today's and yesterday's highest paid amount
    const result = await Order.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()), // Today's date
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), // Yesterday
          },
        },
      },
      {
        $group: {
          _id: null,
          todayHighestPaid: { $max: '$subtotal_price' },
        },
      },
      {
        $project: {
          _id: 0,
          todayHighestPaid: 1,
        },
      },
    ]);

    const todayHighestPaid = result.length > 0 ? result[0].todayHighestPaid : 0;

    // Query for yesterday's highest paid amount
    const resultYesterday = await Order.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()), // Yesterday's date
            $lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1), // Today's date
          },
        },
      },
      {
        $group: {
          _id: null,
          yesterdayHighestPaid: { $max: '$subtotal_price' },
        },
      },
      {
        $project: {
          _id: 0,
          yesterdayHighestPaid: 1,
        },
      },
    ]);

    const yesterdayHighestPaid = resultYesterday.length > 0 ? resultYesterday[0].yesterdayHighestPaid : 0;

    res.json({ todayHighestPaid, yesterdayHighestPaid });
  } catch (error) {
    console.error('Error fetching highest paid amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

