import React, { useEffect, useState, useCallback } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import {
    Page,
    LegacyCard,
    IndexTable,
    Pagination,
    Spinner,
    Thumbnail,
    useIndexResourceState,
    TextField,
    Select,
    Layout,
} from '@shopify/polaris';


//const professions= ['dentist', 'doctor', 'nurse', 'pharmacist'];

export default function MasterListForm() {

    const fetch = useAuthenticatedFetch();
    const [queryValue, setQueryValue] = useState('');
    const [products, setProducts] = useState([]);  // Product data
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedProfession, setSelectedProfession] = useState();
    // Dummy preselected products (products + variants)
    const [selectedProducts, setSelectedProducts] = useState([]); // Product and variant IDs

     // Debounce timer state
  const [debounceTimer, setDebounceTimer] = useState(null);

    // Fetch profession list
    const [options, setOptions] = useState([]);

    useEffect(() => {         
        fetchProfession();
    },[]);

    useEffect(() => {
        // Log state to check if selectedProfession is updated
        console.log('Current selected profession:', selectedProfession);
        if(selectedProfession){
            clearSelection();  
            fetchProductInfo();
        //fetchMasterList();
        }
    }, [currentPage, selectedProfession]);

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
            // Automatically set the first profession as the default selection if none is selected
            if(data.length > 0){
                //console.log("############################ Have Set the selected Professional", data[0]);
                setSelectedProfession(data[0]);
            }
        }catch(error){
            console.error("Error fetching profession list", error);
            alert("Failed to fetch profession list");
        }
    }


    // Fetch products for the current page
    async function fetchProductInfo(search = '') {
        setLoading(true);
        let request = await fetch(`/api/products?page=${currentPage}&profession=${selectedProfession}&search=${search}`);
        let response = await request.json();
        setProducts(response.productList);
        console.log("The producted list: ",response.productList);
        setTotalPages(response.totalPages);
        setLoading(false);

        const preselectedProducts = response.productList.flatMap(product => {
    
            return product.variants.filter(varaint => varaint.included).map(varaint => varaint.id);
        });
        //console.log("#############Preselected Products:", preselectedProducts);
        setSelectedProducts(preselectedProducts);
        //selectProductExplicitly(preselectedProducts);
    }


    const productIds = products.flatMap(product => [
        product.id,  // Include the main product ID
        ...product.variants.map(variant => variant.id)  // Include all variant IDs
    ]);

    // Initialize useIndexResourceState with productIds and selectedProducts
    const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } = useIndexResourceState(
        productIds,  // Include both product and variant IDs
    );

    const handleVariantToggle = (variantId) => {
        // Check if variant is already selected or pre-included
        const isSelected = selectedResources.includes(variantId);
        
        if (isSelected) {
            // If selected or included, uncheck by removing the variantId from selectedResources
            handleSelectionChange("single", false, variantId);
        } else {
            // If not selected, check by adding the variantId to selectedResources
            handleSelectionChange("single", true, variantId);
        }
    };

        // Re-select preselected products after fetching
        useEffect(() => {
            if (products.length > 0 && selectedProducts.length > 0) {
                selectProductExplicitly(selectedProducts);
            }
        }, [products, selectedProducts]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const saveMasterList = async() => {
        const productIds = { productIds : selectedResources};

        try{
            const response = await fetch(`/api/masterlist/${selectedProfession}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productIds)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Master list saved:', data);
                console.log('Master list saved:', data);
                // Optionally show success message or handle response
            } else {
                console.error('Failed to save master list');
            }
        }catch(error){
            console.error('Error saving master list:', error);
        }
    }

    // Handle submission or further operations
    const handleSubmit = () => {
        console.log('Selected Products and Variants:', selectedResources);
        saveMasterList();
        // Handle the submission of selected products to the master list here
    };

    const handleProfessionChange = (value) => {
        // console.log(value);
        setSelectedProfession(value);
    }

    const handleQueryChange = useCallback(
        (value) => {
            setQueryValue(value);

            // clear the previous timer
            if(debounceTimer){
                clearTimeout(debounceTimer);
            }

            //set a new debounce timer
            const newDebounceTimer = setTimeout(() => {
                if(value.trim() !== "" && value.length > 2){
                    fetchProductInfo(value);
                }
            }, 500);
            setDebounceTimer(newDebounceTimer);
            // Fetch products with search query
        
        }, [debounceTimer]
    );


    // Function to programmatically select products
    const selectProductExplicitly = (productIds) => {
        console.log(' ############################################# Explicitly Selected:', productIds);
        productIds.forEach((id) => {
            if (!selectedResources.includes(id)) {
                // Select product if it's not already selected
                console.log("###### Inside the loop:", id);
                try{
                handleSelectionChange("single", true, id);
            }catch(error){ console.log(error);}
            }
        });
    };



    // Display products and variants with selection
    const rowMarkup = products.map(({ id, images, sku, title, product_type, price, vendor, variants }, index) => (
        <React.Fragment key={id}>
            {/* Main product row */}
            <IndexTable.Row 
                id={id}
                key={id}
                selected={selectedResources.includes(id)}  // Track selection
                position={index}
                onSelectionChange={() => { 
                    handleSelectionChange(id)
                    console.log('Selected resource', selectedResources);
                }}
            >
                <IndexTable.Cell>
                    <Thumbnail
                        source={images[0] || 'https://placeholder.pics/svg/300'}  // Display first image or placeholder
                        alt={title}
                    />
                </IndexTable.Cell>
                <IndexTable.Cell>{sku}</IndexTable.Cell>
                <IndexTable.Cell>{selectedResources.includes(id) ? "Yes" : ''}</IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>{product_type}</IndexTable.Cell>
                <IndexTable.Cell>{price}</IndexTable.Cell>
                <IndexTable.Cell>{vendor}</IndexTable.Cell>
            </IndexTable.Row>

            {/* Variant rows */}
            {variants.map((variant) => (
                <IndexTable.Row
                    id={variant.id}
                    key={variant.id}
                    selected={selectedResources.includes(variant.id) }  // Track selection for variants
                    onSelectionChange={() => handleVariantToggle(variant.id)}
                >
                    <IndexTable.Cell />
                    <IndexTable.Cell>{variant.sku}</IndexTable.Cell>
                    <IndexTable.Cell>{selectedResources.includes(variant.id) ? "Yes" : ''}</IndexTable.Cell>

                    <IndexTable.Cell>{variant.title}</IndexTable.Cell>
                    <IndexTable.Cell />
                    <IndexTable.Cell>{variant.price}</IndexTable.Cell>
                    <IndexTable.Cell />
                </IndexTable.Row>
            ))}
        </React.Fragment>
    ));

    return (
        <Page fullWidth title="Assign Products to Master List">
          
            <LegacyCard sectioned>
                <Select
                    label="Select Profession"
                    options={options}
                    onChange={handleProfessionChange}
                    value={selectedProfession}
                    />

                <TextField 
                        label="Search"
                        value= {queryValue}
                        onChange={handleQueryChange}
                        placeholder="Search products..." 
                        clearButton
                        onClearButtonClick={() => setQueryValue('')}
                    />
            </LegacyCard>

            <LegacyCard sectioned>
                
                {loading ? (
                    <Spinner />
                ) : (
                    <>
                        <IndexTable
                            resourceName={{ singular: 'product', plural: 'products' }}
                            itemCount={products.length}
                            selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                            onSelectionChange={handleSelectionChange}  // Controlled selection
                            headings={[
                                { title: 'Image' },
                                { title: 'SKU' },
                                {title: 'Included'},
                                { title: 'Title/Variant' },
                                { title: 'Product Type' },
                                { title: 'Price' },
                                { title: 'Vendor' },
                            ]}
                        >
                            {rowMarkup}
                        </IndexTable>

                        <Pagination
                            hasPrevious={currentPage > 1}
                            hasNext={currentPage < totalPages}
                            onPrevious={() => handlePageChange(currentPage - 1)}
                            onNext={() => handlePageChange(currentPage + 1)}
                        />
                    </>
                )}
                {/* Button to submit selected products */}
                <LegacyCard.Section>
                    <button
                        onClick={handleSubmit}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Add Selected to Master List
                    </button>
                </LegacyCard.Section>
            </LegacyCard>
        </Page>
    );
}

