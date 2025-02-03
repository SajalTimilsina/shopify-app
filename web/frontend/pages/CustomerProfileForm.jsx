import React, { useState, useEffect } from 'react';
import { Page, Card, Form, FormLayout, TextField, Button, Select, LegacyCard } from '@shopify/polaris';
import axios from 'axios';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { CheckBox } from '@mui/icons-material';

const CustomerProfileForm = () => {
    const [customerId, setCustomerId] = useState('');
    const [customerIdConv, setCustomerIdConv] = useState('');
    const [profession, setProfession] = useState('');
    const [professionConv, setProfessionConv] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [storeId, setStoreId] = useState('');  // You will get this dynamically from Shopify context
    const [options, setOptions] = useState([]);
    const fetch = useAuthenticatedFetch();
    const [newProfession, setNewProfession] = useState('');

    useEffect(() => {
        fetchProfession();
    }, []);

    async function fetchProfession(){
        try { 
            const response = await fetch(`/api/profession/list`);
            if(!response.ok){alert("Failed to fetch profession list");}
            const data = await response.json();
            console.log("Profession List: ", data);
            const options = data.map(profession => {
                return {label: profession, value: profession}
            });
            setOptions(options);
        }catch(error){
            console.error("Error fetching profession list", error);
            alert("Failed to fetch profession list");
        }
    }

    const handleSelectChange = (value) => {
        setProfession(value);
    }

    const handleSubmitProfession = async () => {
        try {
            const response = await fetch(`/api/profession/create`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({profession: newProfession})
            });
            const data = await response.json();
            if(response.ok){
                alert(data.message);
                setNewProfession('');
                await fetchProfession();
            } else {
                console.log("Error:", data.message);
                alert(data.message);
            }
        }catch(error){
            console.error("Error creating new profession", error);
            alert("Failed to create new profession");
        }
    }


    const handleSubmit = async () => {
        try {
       
            const response = await fetch(`/api/customer/profile`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    customerId,
                    profession,
                })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.message);
                alert(data.message);
            } else{
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating customer profile', error);
            alert('Failed to update customer profile');
        }
    };

    const handleMastertoFavoriteList = async () => {
        alert("Convert Master list to Favorite List");
        try{
            const response = await fetch(`/api/profession/masterlisttofav`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    customerId: customerIdConv,
                    profession,
                    isChecked
                })
            })

            const data = await response.json();
            if(response.ok){
                alert(data.message);
            }else {
                console.log("Error:", data.message);
                alert(data.message);
            }

        }catch(error){
            console.error("Error converting master list to favorite list", error);
            alert("Failed to convert master list to favorite list");
        }
    }

    const handleCheckboxChange = () => {
        console.log("Checkbox changed");
        setIsChecked(!isChecked);
    }

    return (
        <Page title="Operations">
            <LegacyCard sectioned title = "Link Customer to Master list">
                <Form onSubmit={handleSubmit}>
                    <FormLayout>
                        <TextField
                            label="Customer ID"
                            value={customerId}
                            onChange={setCustomerId}
                            placeholder="Enter Shopify Customer ID"
                        />
                       <Select
                        label="Select Profession/ Listname"
                        options={options}
                        onChange={handleSelectChange}
                        value={profession}
                        />
                        <Button submit primary>Link Customer</Button>
                    </FormLayout>
                </Form>
            </LegacyCard>

            <LegacyCard sectioned title = "Create New Profession/ List">
            <Form onSubmit={handleSubmitProfession}>
                <FormLayout>
                    <TextField
                        label="Profession/ List Name"
                        value={newProfession}
                        onChange={setNewProfession}
                        placeholder="Enter new profession/ list name"
                        />
                        <Button submit primary>Create Profession or List</Button>
                </FormLayout>
                </Form>
            </LegacyCard>

            <LegacyCard sectioned title = "Change Master list to Favorite List ( Customer Can edit the list)">
            <Form onSubmit={handleMastertoFavoriteList}>
                <FormLayout>
                    <TextField
                                label="Customer ID"
                                value={customerIdConv}
                                onChange={setCustomerIdConv}
                                placeholder="Enter Shopify Customer ID"
                            />
                    <Select
                        label="Select Profession/ Listname"
                        options={options}
                        onChange={handleSelectChange}
                        value={profession}
                        />
                        <label> <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} /> *Delete Master List after converting</label>
                        <Button submit primary>Submit</Button>
                </FormLayout>
                </Form>
            </LegacyCard>
        </Page>
    );
};

export default CustomerProfileForm;
