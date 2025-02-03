// GeneralInformationSection.jsx
import React, {useState} from "react";
import "./FormView.css";
import { AddCustomerModal } from '../../Modals/AddCustomerModal';

export const FormView = ({ name, setName, priority, setPriority, status, setStatus }) => {
  return (
    <div className="price-list-editor">
    <div className="section">
      <h3 className="section-header">General Information</h3>
      <label>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter rule name"
      />

      <label>Priority**</label>
      <input
        type="number"
        value={priority}
        min="0"
        max="99"
        onChange={(e) => setPriority(e.target.value)}
      />
      <small>Enter a number between 0 and 99. Note: 0 indicates the highest priority.</small>

      <label>Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Enable">Enable</option>
        <option value="Disable">Disable</option>
      </select>
    </div>
  </div>
  );
};


export const ApplyToCustomers = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSearchClick = () => {
    setModalOpen(true);
  };

  return (
    <div className="apply-to-customers">
      <h3>Apply to Customers</h3>
      <div className="radio-group">
        <label>
          <input type="radio" name="customerType" />
          All (logged-in and not-logged-in customers)
        </label>
        <label>
          <input type="radio" name="customerType" />
          Logged-in customers
        </label>
        <label>
          <input type="radio" name="customerType" />
          Not-logged-in customers
        </label>
        <label>
          Specific customers
          <input
            type="text"
            name="customerType"
            onClick={handleSearchClick}
          />
        </label>
        {isModalOpen && (
          <AddCustomerModal onClose={() => setModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export const ApplyToMarkets = ({ marketType, setMarketType }) => (
  <div className="price-list-editor">
    <div className="section">
      <h3 className="section-header">Apply to Markets</h3>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            value="All"
            checked={marketType === "All"}
            onChange={() => setMarketType("All")}
          />
          All markets
        </label>
        <label>
          <input
            type="radio"
            value="Specific"
            checked={marketType === "Specific"}
            onChange={() => setMarketType("Specific")}
          />
          Specific markets
        </label>
      </div>
      <button className="sync-btn">Sync</button>
    </div>
    </div>
);

