const express = require("express");
const routes = require("./controllers");
const sequelize = require("./config/connection");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build (For production)
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use(routes);

// Catch-all route: Serve React app for unknown routes (For production)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Sync Sequelize and start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () =>
    console.log(`Server running at: http://localhost:${PORT}`)
  );
});
