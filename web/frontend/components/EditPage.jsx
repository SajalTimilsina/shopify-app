import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import { AddProductsTable } from './AddProductsTable';
import { FormView, Gobackbutton, ApplyToCustomers } from './common';

import "./EditPage.css";

const variantsData = [
  {
    id: 1,
    name: "0.3mL | 31G x 5/16\" - BD 320440 Ultra-Fine Insulin Syringes | 100 per Magic Box",
    originalPrice: 72.27,
    modifiedPrice: 10,
    amount: 10,
  },
  {
    id: 2,
    name: "0.2 x 9 mm | TSK Invisible Needles - Low Dead Space | kirti",
    originalPrice: 153.11,
    modifiedPrice: 12,
    amount: 12,
  },
  {
    id: 3,
    name: "0.5mL | 29G x 1/2\" - SOL-CARE 100002IM Insulin Safety Syringe | 100 per Box",
    originalPrice: 65.55,
    modifiedPrice: 12,
    amount: 12,
  },
  {
    id: 4,
    name: "1mL TSK Norm-Ject Luer Slip Syringe - Box of 100 (Green)",
    originalPrice: 59.97,
    modifiedPrice: 12,
    amount: 12,
  },
  {
    id: 5,
    name: "22G x 1 1/2\" - TSK STEriGLIDE Aesthetic Cannula Needle (20 pcs)",
    originalPrice: 259.0,
    modifiedPrice: 12,
    amount: 12,
  },
];

export function EditPage() {

  const {customerName, listName} = useParams();
      const [isModalOpen, setIsModalOpen] = useState(false)
        const [selectedProducts, setSelectedProducts] = useState([]);
    
  const [variants, setVariants] = useState(variantsData);

  const saveList = async () => {
    const virtual = "Test Elmira";   
    try{
        const data = {
            products: selectedProducts,
        };
        const response = await fetch(`/api/masterlist/${virtual}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch(error) {
        console.error('Error:', error);
    }
}

  const handleModifiedPriceChange = (id, newPrice) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, modifiedPrice: newPrice } : variant
      )
    );
  };

  const handleAmountChange = (id, newAmount) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === id ? { ...variant, amount: newAmount } : variant
      )
    );
  };
  return (
    <>
    <Gobackbutton />
    
    <FormView listName={listName} />
    <ApplyToCustomers />
    
    <div className="price-list-editor">
      <h2>Edit Price List</h2>
      
      <button onClick={()=> setIsModalOpen(true)}>Add Products</button>
        {isModalOpen && (
            <AddProductsTable 
                onClose={()=> setIsModalOpen(false)}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                saveList={saveList}
                
            />
        )}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Variants</th>
            <th>Options</th>
            <th>Amount</th>
            <th>Original Price</th>
            <th>Modified Price</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant.id}>
              <td>
                <input type="checkbox" />
              </td>
              <td>{variant.name}</td>
              <td>
                <select>
                  <option>Apply a price</option>
                  <option>Discount</option>
                  <option>Increase price</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={variant.amount}
                  onChange={(e) => handleAmountChange(variant.id, e.target.value)}
                />
              </td>
              <td>${variant.originalPrice.toFixed(2)} CAD</td>
              <td>
                <input
                  type="number"
                  value={variant.modifiedPrice}
                  onChange={(e) =>
                    handleModifiedPriceChange(variant.id, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button>Save Changes</button>
    </div>
    </>
  )
}

