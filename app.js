const express = require('express');
const usersRouter = require('./user');

const app = express();
const PORT = 5000;
app.use('/user', usersRouter); 




app.listen(PORT, () => {
  console.log(`Node.js App running on port ${PORT}...`);
});
