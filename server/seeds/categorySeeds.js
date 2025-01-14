const { Category } = require('../models');

const categories = [
  'Pedicures',
  'Acrylic',
  'Shellac',
  'Dipping Powder',
  'Others',
  'Facial',
  'Waxing',
];

const seedCategories = async () => {
  const categoryData = categories.map((category) => ({
    name: category,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await Category.bulkCreate(categoryData);
};

module.exports = seedCategories;
