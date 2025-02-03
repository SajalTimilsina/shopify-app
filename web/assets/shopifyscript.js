//Step 2: Create a modal 
function createModal() {
    const quickListModal = document.getElementById('quickListModal');

    if(quickListModal){
        updateModalContent();
        quickListModal.classList.add('modal-open');
        return quickListModal;
    }
    const {id, name,sku} = getVariantDetails();

    const modalHTML = `
        <div class="modal__layout modal-open" id="quickListModal">
            <div class="modal__content">
                <div class="modal__header">
                    <h3 class="modal__title">Add to a Quick List</h3>
                    <a class="modal__close-icon" aria-label="Close" id="modalCloseIcon">
                        <span class="cs-icon icon-close"></span>
                    </a>
                </div>
                <div class="modal__bodyEmer">
                    <div class="product-details row">
                        <p data-variantId="${id}">${name}</p>
                        <p>SKU: ${sku}</p>
                    </div>
                    <form id="quickListForm">
                        <div class="form-group">
                            <label for="quickListSelect">Save to Quick List</label>
                            <select id="quickListSelect">
                                <option value="Default">Loading...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="quantitySelect">Desired Quantity</label>
                            <select id="quantitySelect">
                                ${[...Array(10).keys()].map(i => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                                <option value="11+">11+</option>
                            </select>
                            <!-- Custom Quantity Input -->
                            <input type="number" id="customQuantity" min="11" placeholder="Enter quantity" style="display: none; margin-top: 10px;">
                        </div>
                        <div>
                            <button type="submit" class="button button__saveList">Save to Quick List</button>
                        </div>
                    </form>
                    <div id="spinner" style="display:none;"></div>
                </div>
            </div>
        </div>`;



    const createModal = document.createElement('div');
    createModal.innerHTML = modalHTML;
    document.body.appendChild(createModal);


    return createModal;
}

//Step 2.1 Update the modal content
 function updateModalContent(){
    
    const { id, name , sku } = getVariantDetails();

    console.log(`Updating the modal content with ${id}, ${name}, ${sku}`);
    const productDetails = document.querySelector('.modal__bodyEmer .product-details');
    //console.log(`Product Details: ${productDetails}`);
    if(productDetails){
        productDetails.innerHTML = `<p data-variantId=${id}><a href="#">${name}</a></p><p>SKU: ${sku}</p>`;
        
        console.log("Modal content updated successfully -----------");
    } else {
        console.error('Could not update the modal content bcz product details not found');
    }
 }



//Step 3: Populate the modal with quicklist options

async function populateQuickListOptions() {

    const quickListSelect = document.getElementById('quickListSelect');
    const response = await fetch(`${location.origin}/apps/proxy-1/quickorderlist/${customerId}?shop=${Shopify.shop}&showMasterList=false`);
    const data = await response.json();
    console.log(`Populate Quick List options Data: ${data}`);
    // const data = ['Mississauuga Clinic', 'Toronto Clinic', 'Brampton Clinic', 'Scarborough Clinic', 'Markham Clinic'];
    
    if(data && data.length > 0){
        quickListSelect.innerHTML = data.map(item => `<option value="${item}">${item}</option>`).join('');
    } else{
        quickListSelect.innerHTML = '<option value="Default">Default</option>';
    }
}

//Step 4: Handle the quantity selector

function handleQuantitySelection(){
    const quantitySelect = document.getElementById('quantitySelect');
    const customQuantity = document.getElementById('customQuantity');

    quantitySelect.addEventListener('change', function(){
        if(this.value === '11+'){
            customQuantity.style.display = 'block';
        } else {
            customQuantity.style.display = 'none';
        }
    })
}

//Step 5: Handle the form submission

function handleFormSubmission(){
    const form = document.getElementById('quickListForm'); 

    form.addEventListener('submit', function(event){
        event.preventDefault();
        
        const selectedList = document.getElementById('quickListSelect').value;
        const quantitySelect = document.getElementById('quantitySelect').value;
        const customQuantity = document.getElementById('customQuantity').value;
        const variantHTMLPopup = document.querySelector("p[data-variantId]");
        const variantId = variantHTMLPopup.getAttribute('data-variantId');
        console.log(`Variant ID from submit form: ${variantId}`); 

        const quantity = quantitySelect === '11+' ? customQuantity : quantitySelect;

        if(!selectedList || !quantity){
            alert('Please select a Quick List and a quantity');
            return;
        }

        showSpinner(true);

        const payload = {customerId, variantId, quantity, selectedList, showMasterList: false};

        fetch(`${location.origin}/apps/proxy-1/quickorderlist/${customerId}?shop=${Shopify.shop}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            showSpinner(true, data.message);

            setTimeout(() => {showSpinner(false);}, 3000);
            //const recreateModal = document.querySelector(".modal__bodyEmer");
            //recreateModal.innerHTML = `<p>${data.message}</p>`;
            //alert(data.message);

        })
        .catch(error => {
            console.error(error);
            showSpinner(false);
            const recreateModal = document.querySelector(".modal__bodyEmer");
            recreateModal.innerHTML = `<p>An error occured while adding the item to Quick List. Contact Customer Support</p>`;
            //alert('An error occured while adding the item to Quick List. Contact Customer Support');
        });

    })
}


//Step 6 : Show spinner

function showSpinner(show, message = 'Loading...'){
    const spinner = document.getElementById('spinner');
    spinner.style.display = show ? 'block' : 'none';
    spinner.innerHTML = message;
}


//Step 7 : Handle addToQuickOrderList

function addToQuickOrderList(){
    //const variantHTML = document.querySelector('input[name="id"]');
    // const metaVariants = meta.product.variants;
    // const variantIdNow = getVariantId();
    // console.log(`Meta Variants: ${JSON.stringify(metaVariants, null, 2)}`);
    // //const variantHTML = document.querySelector('input[type="hidden"]');

    // //console.log(`Variant HTML: ${variantHTML.value.id}`);
    // const variantDetails = metaVariants.find(variant => variant.id === parseInt(variantIdNow));
    // console.log(`Variant Details: ${JSON.stringify(variantDetails, null, 2)}`);
    //const customId = customerId;
    // const variantDetails = getVariantDetails();
    createModal();

    populateQuickListOptions();
    handleQuantitySelection();
    handleFormSubmission();
    handleModelClose();

}


function handleModelClose(){
    const modalClose = document.getElementById('modalCloseIcon');

    modalClose.addEventListener('click', function(){
        //console.log('Close button clicked ............');
        const modal = document.getElementById('quickListModal');
        modal.classList.remove('modal-open');
    })
}


//Step 1: Subject the "Add to quicklist" button to the DOMContentLoaded event

    const addToCart__12button = document.querySelector('button[name="add"][type="submit"]');
    const customerId = meta.page.customerId;
    if(!customerId) { console.log("Customer is not logined"); }


    if(meta.page.pageType === 'product' && addToCart__12button && customerId){
        // const metaVariants = meta.product.variants;
        // console.log(`Meta Variants: ${metaVariants}`);
        //const variantDetails = metaVariants.find(variant => variant.id === parseInt(variantHTML.value));
        // Create button Add to QuickList
        if(addToCart__12button){
            const div = document.createElement('div');
            div.classList.add('col-12', 'col-sm-6');
            div.style.padding = "10px";
            const newButton = document.createElement('button');
            newButton.innerHTML = 'Add to QuickList';
            newButton.classList.add('button');
            
            newButton.addEventListener('click', function(event){
                event.preventDefault();
                event.stopPropagation();
                addToQuickOrderList();
            })
            div.appendChild(newButton);
            addToCart__12button.parentNode.appendChild(div);
        } else {
            console.error('Button or variant details not found');
        }

    } 
    
    // else if(meta.page.pageType === 'collection' && customerId){
    //     console.log('Collection Page detetected');
    //     const viewDetailsButton = document.querySelectorAll('.viewDetails__custom .view-details-button');
    //     console.log(`View Details Button: ${viewDetailsButton}`);

    //     if(viewDetailsButton){
    //         viewDetailsButton.forEach(button => { 
    //         const div = document.createElement('div');
    //         div.classList.add('col-12', 'col-sm-6');
    //         div.style.padding = "10px";
    //         const newButton = document.createElement('button');
    //         newButton.innerHTML = 'Add to QuickList';
    //         newButton.classList.add('button');
            
    //         newButton.addEventListener('click', function(event){
    //             event.preventDefault();
    //             event.stopPropagation();
    //             addToQuickOrderList();
    //         })
    //         div.appendChild(newButton);
    //         console.log(button.parentNode);
    //         button.parentNode.appendChild(div);
    //     });
    //     } else {
    //         console.error('Button or variant details not found');
    //     }
    // }

    // Listen to URl Change
    let lastUrl = location.href;
    window.addEventListener('popstate', onUrlChange);

    // Override pushState and replaceState to detect programmatic URL changes
    const originalPushState = history.pushState;
    history.pushState = function () {
        originalPushState.apply(history, arguments);
        onUrlChange();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function () {
        originalReplaceState.apply(history, arguments);
        onUrlChange();
    };

    //onUrlChange
    function onUrlChange(){
        const url = location.href;
        if(url !== lastUrl){
            lastUrl = url;
            updateModalContent();
            console.log('URL Changed ............');
            
        }
    }

    //getVaraintID
    function getVariantDetails(){
        const params = new URLSearchParams(window.location.search);
        let varaintId = null;
        const variantHTML = document.querySelector('input[type="hidden"][data-variant-image=""]');
        const variantHTML2 = document.querySelector('input[type="hidden"][name="id"]');
        if(params.has("variant") || variantHTML || variantHTML2){
            if(params.has("variant")){
                varaintId = params.get("variant");
            } 
            else if (variantHTML2){
                varaintId = variantHTML2.value;
            }
            else {
                varaintId = variantHTML.value;
            }
            console.log(`### Detected Variant ID: ${varaintId}`);
            const metaVariants = meta.product.variants;
            const variantDetails = metaVariants.find(variant => variant.id === parseInt(varaintId));
            if(variantDetails){
                console.log(`Variant Details: ${JSON.stringify(variantDetails, null, 2)}`);
                return variantDetails;
            }
        }  else { return null;}
       
    }

