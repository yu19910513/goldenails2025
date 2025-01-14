const { Service, Category } = require('../models');

const services = [
  {
    category: 'Pedicures',
    items: [
      { name: 'Basic Pedicure', price: 35 },
      { name: 'Basic Plus Organic Pedicure', price: 40 },
      { name: 'Basic Plus Deluxe Organic Pedicure', price: 50 },
      { name: 'Organic Pedicure (Paraben Free)', price: 55 },
      { name: 'Volcano Spa Pedicure', price: 55 },
      { name: 'Gels (Extra)', price: 15 },
    ],
  },
  {
    category: 'Acrylic',
    items: [
      { name: 'Full Set Acrylic White Tip', price: 41 },
      { name: 'Fill Acrylic', price: 31 },
      { name: 'Pink & White Full Set', price: 50 },
      { name: 'Pink & White Fill', price: 40 },
      { name: 'Silk Full Set', price: 50 },
      { name: 'Silk Fill', price: 40 },
      { name: 'Liquid Gel Full Set', price: 55 },
      { name: 'Liquid Gel Fill', price: 40 },
    ],
  },
  {
    category: 'Shellac',
    items: [
      { name: 'Shellac', price: 25 },
      { name: 'Shellac French', price: 30 },
      { name: 'Shellac Polish Change', price: 30 },
      { name: 'Shellac French Polish Change', price: 35 },
      { name: 'Shellac with Manicure', price: 35 },
      { name: 'Regular Manicure', price: 25 },
    ],
  },
  {
    category: 'Dipping Powder',
    items: [
      { name: 'Dipping Powder Set', price: 46 },
      { name: 'Dipping Ombre', price: 56 },
    ],
  },
  {
    category: 'Others',
    items: [
      { name: 'Polish Change', price: 15 },
      { name: 'Nail Repair', price: 6 },
      { name: 'French', price: 6 },
      { name: 'Nail Design', price: 6 },
      { name: 'Soak Off Nails / Shellac', price: 10 },
    ],
  },
  {
    category: 'Facial',
    items: [
      { name: 'Facial Seacret', price: 46 },
      { name: 'Facial', price: 450 },
    ],
  },
  {
    category: 'Waxing',
    items: [
      { name: 'Half Legs', price: 35 },
      { name: 'Full Legs', price: 50 },
      { name: 'Half Arms', price: 25 },
      { name: 'Full Arms', price: 35 },
      { name: 'Under Arms', price: 25 },
      { name: 'Bikini', price: 3560 },
      { name: 'Back', price: 5060 },
      { name: 'Stomach', price: 10 },
      { name: 'Cheeks', price: 10 },
      { name: 'Eyebrows Tint', price: 15 },
      { name: 'Eyebrows', price: 12 },
      { name: 'Upper Lip', price: 8 },
      { name: 'Chin', price: 10 },
      { name: 'Hair Line', price: 10 },
    ],
  },
];

const seedServices = async () => {
  for (const service of services) {
    // Find the category ID
    const category = await Category.findOne({ where: { name: service.category } });

    // Prepare service data
    const serviceData = service.items.map((item) => ({
      name: item.name,
      price: item.price,
      category_id: category.id,
      time: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // Insert into database
    await Service.bulkCreate(serviceData);
  }
};

module.exports = seedServices;
