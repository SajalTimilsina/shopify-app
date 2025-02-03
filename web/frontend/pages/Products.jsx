import React, { useState, useEffect } from 'react';
import { Page, Spinner, Banner, Select, AlphaCard, DataTable, Layout, TextContainer } from '@shopify/polaris';
import { useAuthenticatedFetch } from "../hooks";

export default function Products() {
    const fetch = useAuthenticatedFetch();
    const [customerIds, setCustomerIds] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [customerProducts, setCustomerProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function fetchCustomerDetails() {
        try {
            setIsLoading(true);
            let request = await fetch("/api/getcustomer");
            let response = await request.json();
            setCustomerIds(response);
        } catch (error) {
            console.error("Failed to fetch customer details:", error);
            setError("Failed to fetch customer details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchCustomerProducts() {
        try {
            setIsLoading(true);
            let request = await fetch(`/api/customers/${selectedCustomer}/products`);
            let response = await request.json();
            setCustomerProducts(response);
            console.log("Customer Products Response:", response);
        } catch (error) {
            console.error("Failed to fetch customer products:", error);
            setError("Failed to fetch customer products. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            fetchCustomerProducts();
        }
    }, [selectedCustomer]);

    const handleSelectChange = (value) => {
        setSelectedCustomer(value);
    }

    const rows = customerProducts?.productList?.flatMap((product) =>
        product.variants.map((variant) => [
            <img src={product.images[0]} alt={product.title} style={{ width: '50px', height: '50px' }} />,
            product.title,
            variant.sku,
            variant.price,
        ])
    ) || [];

    const customerOptions = customerIds.map((id) => ({
        label: `Customer ${id}`,
        value: id,
    }));

    return (
        <Page title="Customer Products">
            <Layout>
                <Layout.Section>
                    <AlphaCard sectioned>
                        <TextContainer>
                            <p>Select a customer to view their products.</p>
                            <Select
                                label="Select a customer"
                                options={customerOptions}
                                onChange={handleSelectChange}
                                value={selectedCustomer}
                                placeholder="Select a customer"
                            />
                        </TextContainer>
                    </AlphaCard>
                </Layout.Section>

                <Layout.Section>
                    {isLoading ? (
                        <Spinner accessibilityLabel="Loading customer data" size="large" />
                    ) : error ? (
                        <Banner status="critical">{error}</Banner>
                    ) : selectedCustomer ? (
                        <AlphaCard title={`Customer ${selectedCustomer} Products`} sectioned>
                            <DataTable
                                columnContentTypes={['text', 'text', 'numeric', 'numeric']}
                                headings={['Image', 'Product Title', 'SKU', 'Price']}
                                rows={rows}
                            />
                        </AlphaCard>
                    ) : (
                        <AlphaCard sectioned>
                            <TextContainer>
                                <p>No products found. Please select a customer.</p>
                            </TextContainer>
                        </AlphaCard>
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
