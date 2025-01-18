const express = require("express");
const router = express.Router();
const { Miscellaneous } = require("../../models");


/**
 * @route GET /:title
 * @description Retrieves a miscellaneous entry based on the provided title, with specific attributes (`title` and `context`).
 * @access Public
 * 
 * @param {Object} req - The request object containing the URL parameter `title`.
 * @param {Object} res - The response object used to send back the retrieved data or error.
 * 
 * @returns {Object} 200 - JSON object containing the `title` and `context` of the miscellaneous entry.
 * @returns {Object} 404 - JSON object with an error message if the miscellaneous data is not found.
 * @returns {Object} 500 - JSON object with an error message if an internal server error occurs.
 * 
 * @throws {Error} - If an error occurs while querying the database.
 */
router.get(`/:title`, async (req, res) => {
    try {
      const { title } = req.params;
      const miscellaneous = await Miscellaneous.findOne({
        where: { title },
        attributes: ["title", "context"], // Only retrieves `title` and `context`
      });
  
      if (!miscellaneous) {
        return res.status(404).json({ message: "This miscellaneous data is not found." });
      }
  
      const data = miscellaneous.get({ plain: true });
      console.log(data);
      
      res.json(miscellaneous);
    } catch (error) {
      console.error("Error searching miscellaneous data:", error);
      res.status(500).json({ error: "An error occurred while searching for the miscellaneous data." });
    }
  });
  


module.exports = router;
