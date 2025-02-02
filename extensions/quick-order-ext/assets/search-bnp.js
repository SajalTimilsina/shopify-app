console.log("Loading Search bar ....")
let selectedProductId = null;

function toggleClearButton(){

	const  clearInput = document.querySelector(".clear-button");
	const inputFieldText = document.getElementById("inputFieldText");

	clearInput.style.display = inputFieldText.value ? "block" : "none";

}

function clearInput(){

	const inputFieldText = document.getElementById("inputFieldText");

	inputFieldText.value ="";
	itemList.style.display = 'none';

	toggleClearButton();
  //clear the selected product id
  selectedProductId = null;

}

const inputFieldText = document.getElementById("inputFieldText");
const itemList = document.getElementById("itemList");
const optionFieldSelect = document.getElementById("optionFieldSelect");
const addToList = document.querySelector(".add-to-list");
let datas= null;

console.log(itemList)

if(itemList){ console.log(itemList)}

inputFieldText.addEventListener("input", async function(event){
  
 // if(event.key === "Enter"){
	if(event.target.value.length > 2){
		//event.preventDefault();

		itemList.innerHTML ="";

		// call API
    const apiData = await fetchProductsData(inputFieldText.value);
    const dataArray = Object.entries(apiData);
    
			// const dataArray = Object.entries(apiData);
    
      if(dataArray.length != 0){

        dataArray.forEach(function([key, data]) {
          const listItem = document.createElement("li");
          listItem.textContent = `${data.variants.sku} ${data.title} ${data.variants.title?.trim().toLowerCase() !== "default title" ? " - "+data.variants.title : ""}`;
          
          listItem.addEventListener('click', function(){
            // get the text and populate the input field
            inputFieldText.value  = listItem.textContent;
    
            // update the selectedProductId variable
            selectedProductId = data.variants.id;
            itemList.style.display = 'none';
            console.log("Selected Product ID: ", selectedProductId);
          })
          itemList.appendChild(listItem);
        })
        
        itemList.style.display = 'block';
    }

	
	} 
})

addToList.addEventListener("click", function(event){
  const selectOption_Validate = document.querySelector(".select-option");

  event.preventDefault();
  handleFormSubmission_searchBar();
})



//function fetchProductsData(query){

  async function fetchProductsData(query){

    try {
      const response = await fetch(`${location.origin}/apps/proxy-1/search?shop=${Shopify.shop}&querySearch=${query}`);
      if(!response.ok){
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.data;

    }catch(error){
      console.error(error);
      return [];
    }
  }

//function fetchProductsData(query){
// 	return fetch(`${location.origin}/apps/proxy-1/search?shop=${Shopify.shop}&querySearch=${query}`)
// 	.then(response => {
// 		if(!response.ok){
// 			throw new Error("Network response was not ok");
// 		}
// 		return response.json();
// 	})
// 	.then( data => {
// 		console.log(data);
// 		datas = data.data;
// 		return data.data;
		
// 	})
// 	.catch( error => {
// 		console.error("There has been a problem with your fetch operation:", error);
// 		return [];
// 	})	
	
// }



function handleFormSubmission_searchBar(){
 
      const selectOption = document.querySelector(".select-option");
      const listDropdown = document.querySelector("#listDropdown");
      const selectedID = document.querySelector("#inputFieldText").value;
      const selectedList = listDropdown.value;
      const customerId = meta.page.customerId;
      const variantId = selectedProductId;
      const quantity = parseInt(selectOption.value, 10);

      if( selectOption === null || !selectedProductId || !quantity ){ showErrorModal_search("Selected item or quantity not found", "Warning"); return; }
      

      console.log(`Selected List: ${selectedList}, Quantity: ${quantity}, Variant ID: ${variantId}`);
      if(selectedList === "none") {showErrorModal_search("<p>Please select the list</p>", ""); return;}

      //showLoading();
      //showSpinner(true);

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
          //showSpinner(true, data.message);
          //showErrorModal(data.message, "Success");
          showErrorModal_search(data.message, "Success");
          emitCustomEvent(selectedList);

          // setTimeout(() => {showSpinner(false);}, 3000);
          //const recreateModal = document.querySelector(".modal__bodyEmer");
          //recreateModal.innerHTML = `<p>${data.message}</p>`;
          //alert(data.message);

      })
      .catch(error => {
          console.error(error);
          const errorMessage = error.message || "An error occured while adding the item to Quick List. Contact Customer Support";
           alert(errorMessage);
           showErrorModal_search(errorMessage, "Error");
      });

}

function showErrorModal_search(message, status, title ="Message"){
  const errorModal = document.getElementById("quickListModal");
  const modalTitle = errorModal.querySelector(".modal__title");
  let errorMessage = `${status} ${message}`;

  modalTitle.textContent = title;
  
  if(status.toLowerCase() === 'error'){
      errorMessage += `.Contact the customer support. <a href="tel:1-888-401-3637"> Call Us : 1-888-401-3637</a>`;
  }
  if(status.toLowerCase() === 'success'){
      errorMessage += '<i style="color:#f87733;"> Please refresh the list</i>';
  }

  //hideLoading();
  errorModal.classList.add("modal-open");
  errorModal.querySelector(".product-details").innerHTML = errorMessage;

  errorModal.querySelector("#modalCloseIcon").addEventListener('click', () => {
      errorModal.classList.remove("modal-open");
  })
}


function emitCustomEvent(selectedList){
  const event = new CustomEvent("refreshProductList", {
    detail: {selectedList : selectedList}
  });
  window.dispatchEvent(event);
}

// setTimeout(() => {
//   emitCustomEvent();
// }, 2000);