import React, { useEffect, useState }  from 'react';
import './NailSalonMenu.css'; // Add this stylesheet
import ItemService from '../services/itemService';

const NailSalonMenu = () => {
  ItemService.getAll()
      .then((res) => {
        console.log(res.data);  
      })
      .catch((err) => {
        console.error("Error:", err);
      });

  const services = [
    {
      category: 'Pedicures',
      items: [
        { name: 'Basic Pedicure', price: '$35' },
        { name: 'Basic Plus Organic Pedicure', price: '$40' },
        { name: 'Basic Plus Deluxe Organic Pedicure', price: '$50' },
        { name: 'Organic Pedicure (Paraben Free)', price: '$55' },
        { name: 'Volcano Spa Pedicure', price: '$55' },
        { name: 'Gels (Extra)', price: '$15' },
      ],
    },
    {
      category: 'Nail Enhancements - Acrylic',
      items: [
        { name: 'Full Set Acrylic White Tip', price: '$40 & up' },
        { name: 'Fill Acrylic', price: '$30 & up' },
        { name: 'Pink & White Full Set', price: '$50' },
        { name: 'Pink & White Fill', price: '$40' },
        { name: 'Silk Full Set', price: '$50' },
        { name: 'Silk Fill', price: '$40' },
        { name: 'Liquid Gel Full Set', price: '$55' },
        { name: 'Liquid Gel Fill', price: '$40' },
      ],
    },
    {
      category: 'Shellac',
      items: [
        { name: 'Shellac', price: '$25' },
        { name: 'Shellac French', price: '$30' },
        { name: 'Shellac Polish Change', price: '$30' },
        { name: 'Shellac French Polish Change', price: '$35' },
        { name: 'Shellac with Manicure', price: '$35' },
        { name: 'Regular Manicure', price: '$25' },
      ],
    },
    {
      category: 'Dipping Powder',
      items: [
        { name: 'Dipping Powder Set', price: '$45 & up' },
        { name: 'Dipping Ombre', price: '$55 & up' },
      ],
    },
    {
      category: 'Other Services',
      items: [
        { name: 'Polish Change', price: '$15' },
        { name: 'Nail Repair', price: '$5 & up' },
        { name: 'French', price: '$5 & up' },
        { name: 'Nail Design', price: '$5 & up' },
        { name: 'Soak Off Nails / Shellac', price: '$10' },
      ],
    },
    {
      category: 'Facial',
      items: [
        { name: 'Facial Seacret', price: '$45 & up' },
        { name: 'Facial', price: '$45-$60' },
      ],
    },
    {
      category: 'Waxing',
      items: [
        { name: 'Half Legs', price: '$35' },
        { name: 'Full Legs', price: '$50' },
        { name: 'Half Arms', price: '$25' },
        { name: 'Full Arms', price: '$35' },
        { name: 'Under Arms', price: '$25' },
        { name: 'Bikini', price: '$35-$60' },
        { name: 'Back', price: '$50-$60' },
        { name: 'Stomach', price: '$10' },
        { name: 'Cheeks', price: '$10' },
        { name: 'Eyebrows Tint', price: '$15' },
        { name: 'Eyebrows', price: '$12' },
        { name: 'Upper Lip', price: '$8' },
        { name: 'Chin', price: '$10' },
        { name: 'Hair Line', price: '$10' },
      ],
    },
  ];

  return (
    <div className="menu-container">
      <div className="menu-grid">
        {services.map((serviceCategory, index) => (
          <div className="menu-card" key={index}>
            <h2 className="menu-category">{serviceCategory.category}</h2>
            <ul className="menu-items">
              {serviceCategory.items.map((item, i) => (
                <li className="menu-item" key={i}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NailSalonMenu;
