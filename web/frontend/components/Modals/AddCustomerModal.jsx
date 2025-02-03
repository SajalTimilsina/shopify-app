import React from 'react';
import './AddCustomerModal.css';

export const AddCustomerModal = ({ onClose }) => {
  const customers = [
    'akeil.yakub@yahoo.ca - Akeil Yakub',
    'atrey1@gmail.com - Angela Lafkovici',
    'apate218@uottawa.ca - Anjali Patel',
    'celesteni0607@gmail.com - Shuhan Ni',
    // Add more customers...
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Select Specific Customers</h3>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          <input type="text" placeholder="Search" className="search-bar" />
          <p>Showing {customers.length} customers</p>
          <ul className="customer-list">
            {customers.map((customer, index) => (
              <li key={index} className="customer-item">
                <label>
                  <input type="checkbox" />
                  {customer}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="modal-footer">
          <button className="select-button" onClick={onClose}>Select</button>
        </div>
      </div>
    </div>
  );
};
