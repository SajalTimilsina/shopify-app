import React, { useState, useEffect} from "react";
import "./PriceListTable.css";
import { AddProductsTable } from "./AddProductsTable";
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';


export function PriceListTable() {
   // is modal open or not
    // selected products and change selected products

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState([]);
    const fetch = useAuthenticatedFetch();

    // Load the user data
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

    useEffect(() => {
        async function fetchData() {
            const virtual = "Test Elmira";
            const response = await fetch(`/api/masterlist/${virtual}`);
            const data = await response.json();
            console.log(`### Data: ${JSON.stringify(data, null, 2)}`);
            
        }
        fetchData();
    }, []);

  return (
    <div>
        <h1>Product List in the List</h1>
        <button onClick={()=> setIsModalOpen(true)}>Add Products</button>
        {isModalOpen && (
            <AddProductsTable 
                onClose={()=> setIsModalOpen(false)}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                saveList={saveList}
                
            />
        )}
        <h2>Selected Products Varaints</h2>
        {/* <ul>
            {selectedProducts.map((product) => (
                <li key={product.variantId}>{product.variantId}</li>
            ))}
        </ul> */}
    </div>
  );

}