console.log("###: Quick Order Extension Script Loaded");

document.addEventListener("DOMContentLoaded", () => {

    const productTableBody = document.querySelector("#productTable tbody");
    const listDropdown = document.querySelector("#listDropdown");
    const searchInput = document.getElementById("productSearch");
    const listName = listDropdown?.value || "Default";
    const loader = document.querySelector(".loading-overlay");
    const cross = document.querySelector(".cross");

    //fetch the product from the API
    const customerId = meta.page.customerId;

    if(!customerId){ showLoginMessage('/account/login', "Login to see your favorite List"); return;}

    let searchTimeout = null;
    let controller = null; // Declare controller outside the event handler to maintain the state

    fetchFavoriteList();

    function showLoading(){
        loader.style.display = "flex";
        cross.style.display = "flex";
        console.log('Showing the loader');
        setTimeout(() => { hideLoading(); }, 10000);
    }
    function hideLoading(){
        loader.style.display = "none";
        cross.style.display = "none";
        console.log('Hiding the loader');
    }

    function showErrorModal(message, status, title ="Message"){
        const errorModal = document.getElementById("quickListModal");
        const modalTitle = errorModal.querySelector(".modal__title");
        let errorMessage = `${status} ${message}`;

        modalTitle.textContent = title;
        
        if(status.toLowerCase() === 'error'){
            errorMessage += `.Contact the customer support. <a href="tel:1-888-401-3637"> Call Us : 1-888-401-3637</a>`;
        }

        hideLoading();
        errorModal.classList.add("modal-open");
        errorModal.querySelector(".product-details").innerHTML = errorMessage;

        errorModal.querySelector("#modalCloseIcon").addEventListener('click', () => {
            errorModal.classList.remove("modal-open");
        })
    }

    function showLoginMessage(url, message){
        const loginRow = document.createElement("tr");
        const loginCell = document.createElement("td");
        loginCell.setAttribute("colspan", '8');
        loginCell.style.textAlign = "center";
        loginCell.innerHTML = `<a href="${url}"><button class="button">${message}</button></a>`;

        // Append the cell to the row & row to the table body
        loginRow.appendChild(loginCell);
        productTableBody.appendChild(loginRow);
    }
    
    
    // Event Listener for search input
    searchInput.addEventListener('input', event => { 
        const searchTerm = event.target.value;
        const listNameAgain = listDropdown?.value || "Default";
        //console.log("List Name ####", listNameAgain);

        if(searchTerm.length > 3){
            // Clear the previous timeout, customer might start typing again < 1 second and again we will wait for 1 second
            clearTimeout(searchTimeout);

            // Cancel the ongoing API request 
            if(controller){ controller.abort(); console.log("Aborted the previous request"); }

            // Create new controller for the new request
            controller = new AbortController();

            searchTimeout = setTimeout(() => {

                // passing the signal to the fetchLists function
                fetchLists(listNameAgain, searchTerm, controller.signal); 
            }, 500);
            
        } else if(searchTerm.length === 0) {
            console.log("Searching from else logic");
            clearTimeout(searchTimeout);
            fetchLists(listNameAgain);
        }
       })

    function fetchFavoriteList(){
        showLoading();
        fetch(`${location.origin}/apps/proxy-1/quickorderlist/${customerId}?shop=${Shopify.shop}/`)
        .then(response => {
            if(!response.ok){throw new Error("Message: Could not load Data from server")};
            return response.json();
        })
        .then(data => {
            console.log(data);
            renderListDropdown(data);
            showLoginMessage('#', "Select a list to see the products");
            hideLoading();
        }).catch(error => {
            if(error.name === 'AbortError') {return;} // Ignore the error if it is an abort error
            console.error("Error fetching favorite list:", error);
            showErrorModal(error.message, "Error");
            //alert("Error fetching favorite list");
            
        })
    }


    function fetchLists(optionListValue, searchTerm = '', signal = null){
        showLoading();
        let apiUrl = `${location.origin}/apps/proxy-1/quickorderlist/${customerId}/${optionListValue}?shop=${Shopify.shop}`;
        if(searchTerm){
            apiUrl += `&search=${searchTerm}`;
        }

        fetch(apiUrl, {signal}) // Passing the signal as the object
        .then(response => {
            if(!response.ok){throw new Error("Message: Could not load Data from server")}
            return response.json();
        })
        .then(data => {
            console.log(data);
            renderProducts(data);
            hideLoading();
        })
        .catch(error => {
            console.error("Error fetching products:", error);
        });
    }

    function renderListDropdown(lists){
        listDropdown.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = 'none';
        defaultOption.textContent = 'Select any list .... {'+lists.length +'} available' ;
        listDropdown.appendChild(defaultOption);

        lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list;
            option.textContent = list;
            listDropdown.appendChild(option);
        })

        //Add divider
        const divider = document.createElement('option');
        divider.disabled = true;
        divider.textContent = '----------------------------------------------------';
        listDropdown.appendChild(divider);

        //Add "Create New List" option
        const createNewOption = document.createElement('option');
        createNewOption.value = 'create-new';
        createNewOption.textContent = 'Create New List';
        listDropdown.appendChild(createNewOption);

        listDropdown.addEventListener('click', event => {
            
            if(event.target.value === 'create-new'){ 
                showCreateListModal();
            }
            else if(event.target.value !== 'none'){
                fetchLists(event.target.value);
            }
        });
    }

    function renderProducts(products){

        let lastProductType = null;
        productTableBody.innerHTML = ''; // Clearing the table body

        products.forEach(product => {
            console.log(product);

            if(product.productType !== lastProductType){
                const typeRow = document.createElement("tr");

                typeRow.classList.add("product-type-header");
                typeRow.innerHTML = `
                <td colspan="6" style="font-weight: bold; background-color: #f2f2f2;">
                    ${product.productType || 'Other Products'}
                </td>
            `;
            
                productTableBody.appendChild(typeRow);
                lastProductType = product.productType;
            }

            const row = document.createElement("tr");
            row.classList.add("product-item");
            const variantTitle = product.variantTitle && product.variantTitle.toLowerCase() !== "default title" ? "<div>Option:"+product.variantTitle+"</div>" : "";

            row.innerHTML = `
            <td><input type="checkbox" class="product-item__checkbox" data-product-id="${product.variantId}"></td> 
            <td><img src="${product.images[0]}" alt="${product.title}" style="width: 100px; height: auto;"></td>
            <td>
                <div><b>${product.title}</b></div>
                ${variantTitle}
                <div>By: ${product.vendor}</div>
                <div>SKU: ${product.sku}</div>
            </td>
                <td>Price: $${product.price}</td>
            <td>
                <input type="number" id="quantity-${product.variantId}" class="custom-quantity-input" value="${product.quantity}" min="1" style="width: 50px;">
            </td>
            <td>
                <button class="button product-item__button add-to-cart-button" data-product-id="${product.variantId}" data-quantity-id="quantity-${product.variantId}">Add to Cart</button>
            </td>
        `;

        productTableBody.appendChild(row);
        });
    }

    function handleAddToCart(event){
        console.log('Called handleAddtoCart');
        event.preventDefault();
        const buttonTargeted = event.target;
        const variantId = buttonTargeted.getAttribute('data-product-id');
        //const quantityId = button.getAttribute('data-quantity-id');
        const quantityContainer = buttonTargeted.closest(".product-item").querySelector('.custom-quantity-input');
        let quantity = 1; // Default quantity
  
        console.log(`######## Quantity Id ${variantId}`);
  
       if (quantityContainer) {
            if (quantityContainer.tagName === 'INPUT' || quantityContainer.type === 'number') {
               quantity = quantityContainer.value;
            } else {
               quantity = quantityContainer.value;
            }
         }
        
        addToCart([{variantId, quantity}])
        .then(data => {
          console.log(`Product Added to Cart:`, data);
          updateButtonState(buttonTargeted);
          updateCartCount();
        })
        .catch(error => {
          console.error(`Error Adding product to Cart`, error);
          showErrorModal(error.description, "Error");
        });
      }
  
    function addToCart(cartObject){
        showLoading();
        console.log("################# Adding to cart", cartObject);
        const data = {
            items: cartObject.map(obj => ({
                id: obj.variantId,
                quantity: parseInt(obj.quantity, 10)
            }))
        };
        console.log("Data to be added to cart", JSON.stringify(data, null,2));

        return fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    return response.json().then(data => {
                        if(!response.ok){
                            throw new Error( data.description || "Error Adding to Cart");
                        }

                        showErrorModal(`Product Added to Cart.`, "Success");
                        hideLoading();
                        return data;
                    })

                })
                .catch(error => {
                    hideLoading();
                    console.error(error);
                    showErrorModal(error, "Error");
                });

    }
  
    function updateButtonState(button){
        button.textContent = "Item Added";
        button.classList.add("added-animation");
        setTimeout(() => {
        button.textContent = "Add to Cart";
        button.classList.remove("added-animation");
        }, 2000);
    }

    function updateCartCount() {
        fetch('/cart.js')
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                    throw new Error(`Network response was not ok: ${err}`);
                    });
                }
                return response.json();
            }).then(cartData => {
                console.log(cartData);
                const cartCount = cartData.item_count || 0;
                const cartCountElements = document.querySelectorAll('.cart-count-bubble span');
    
                if (cartCountElements.length === 0) {
                    console.warn(`No elements found for cart count display`);
                } else {
    
                    cartCountElements.forEach(element => {
                    element.textContent = cartCount;
                    });
                }
            })
            .catch(error => {
                console.error(`Error while updating the cart number${error}`);
            });
        }
            
    function handleBulkAction(action) {
      
        const selectedCheckbox = document.querySelectorAll('#productTable tbody input[type="checkbox"]:checked');
        console.log(selectedCheckbox);
        const arrayOfSelectedCheckbox = Array.from(selectedCheckbox);
        
        const selectedProductList = [];

        arrayOfSelectedCheckbox.map(tableData => {
            const variantId = tableData.getAttribute('data-product-id');

            const row = tableData.closest('tr');

            const quantityInput = row.querySelector('.custom-quantity-input');
            const quantity = quantityInput?.value || 1;
            selectedProductList.push({variantId, quantity});
        });
        if(selectedProductList.length === 0){
            showErrorModal("Please select atleast one product to add to cart", "Warning");
            //alert("Please select atleast one product to add to cart");
            return;
        }
        console.log("Selected list with quantity",selectedProductList);

        if(action === "addToCart"){
            addToCart(selectedProductList).then(data => {
                updateCartCount();   
             });
        }
        else if(action === "delete"){
            console.log("Deleting the selected products");
            deleteFromList(selectedProductList);
        }



    }

    function deleteFromList(selectedProductList){
        const listNameLatest = listDropdown?.value || "Default";
        showLoading();

        fetch(`${location.origin}/apps/proxy-1/quickorderlist/${customerId}/${listNameLatest}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedProductList)
        })
        .then(response => {
            if(!response.ok){
                return response.json().then(errorData => {
                    throw new Error(errorData.message || "Error Deleting the product from the list");
                })
                
            }
            return response.json();
        })
        .then( data => {
            hideLoading();
            fetchLists(listNameLatest);
        })
        .catch(error => {
            console.error("Error Deleting the product from the list", error);
            hideLoading();
            showErrorModal(error.message, "Error");
        });
        
    }

    function showCreateListModal(){
        console.log("Creating new list");

        const modalHTML = `<form id="createNewListForm">
                            <div class="form-group">
                                <label for="quickListSelect">List Name: </label>
                                <input type="text" id="newListName" placeholder="Enter List Name" required>
                            </div>
                            <div>
                                <button type="submit" class="button button__saveList">Create New List</button>
                            </div>
                        </form>`;
        showErrorModal(modalHTML, "", "Create New List");
        handleCreateListForm();
    }

    function handleCreateListForm(){
        const form = document.getElementById('createNewListForm');

        form.addEventListener('submit', event => {
            event.preventDefault();

            const textInput = document.getElementById('newListName');

            showLoading(true);
                fetch(`${location.origin}/apps/proxy-1/quickorderlist/${customerId}/${textInput.value}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if(!response.ok){
                        return response.json().then(errorData => {
                            throw new Error(errorData.message || "Error Creating the new list");
                        })
                    }
                    return response.json();
                })
                .then(data => {
                    hideLoading();
                    showErrorModal("New List Created Successfully", "Success");
                    fetchFavoriteList();
                })
                .catch(error => {
                    console.error("Error Creating the new list", error);
                    hideLoading();
                    showErrorModal(error.message, "Error");
            });
        });
    }

    document.addEventListener('click', function(event){
        if(event.target.classList.contains('add-to-cart-button')){
            handleAddToCart(event);
        }
        else if(event.target.id === 'bulkAddToCart'){
            handleBulkAction("addToCart");
        }
        else if(event.target.id === 'bulkDelete'){
            handleBulkAction("delete");
        }
    });



function setupEventListener() {
    window.addEventListener("refreshProductList", (event) => {
        console.log(" !!!! Received refreshProductList event !!!!", event);
        console.log(event.detail.selectedList);
        fetchLists(event.detail.selectedList);
    })
}

setupEventListener();

});