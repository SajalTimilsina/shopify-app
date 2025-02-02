document.addEventListener("DOMContentLoaded", () => {

    const productTableBody = document.querySelector("#productTable tbody");

    //fetch the product from the API
    const customerId = meta.page.customerId;

    fetch(`${location.origin}/apps/proxy-1/${customerId}/products?shop=${Shopify.shop}`)
    .then(response => {
        if(!response.ok){throw new Error("Message: Could not load Data from server")}
        return response.json();
    })
    .then(data => {
        const productWithDetails = [];

        data.productList.forEach(product => {
            product.variants.forEach(variant => {
                productWithDetails.push({
                    title: product.title,
                    vendor: product.vendor,
                    product_type: product.product_type,
                    SKU: variant.sku,
                    price: variant.price,
                    image: product.images.length > 0 ? product.images[0] : "",
                    productId: variant.product_id,
                    id: variant.id
                });
        });
    });
        renderProducts(productWithDetails);
    })
    .catch(error => {
        console.error("Error fetching products:", error);
    });


    function renderProducts(products){

        let lastProductType = null;

        products.forEach(product => {
            console.log(product);

            if(product.product_type !== lastProductType){
                const typeRow = document.createElement("tr");

                typeRow.classList.add("product-type-header");
                typeRow.innerHTML = `
                <td colspan="5" style="font-weight: bold; background-color: #f2f2f2;">
                    ${product.product_type || 'Other Products'}
                </td>
            `;

            productTableBody.appendChild(typeRow);
            lastProductType = product.product_type;
            }

            const row = document.createElement("tr");
            row.classList.add("product-item");

            row.innerHTML = `
            <td><img src="${product.image}" alt="${product.title}" style="width: 100px; height: auto;"></td>
            <td>
                <div>${product.title}</div>
                <div>By: ${product.vendor}</div>
                <div>SKU: ${product.SKU}</div>
            </td>
                <td>Price: $${product.price}</td>
            <td><span bss-b2b-product-id="${product.productId}" bss-b2b-product-price bss-b2b-product-active="true" style="color: black;" >
            ${product.price} Check at Checkout
            </span></td>
            <td>
                <input type="number" id="quantity-${product.productId}" class="custom-quantity-input" value="1" min="1" style="width: 50px;">
            </td>
            <td>
                <button class="product-item__button add-to-cart-button" data-product-id="${product.id}" data-quantity-id="quantity-${product.productId}">Add to Cart</button>
            </td>
        `;

        productTableBody.appendChild(row);
        });
    }


    function handleAddToCart(event){
        console.log('Called handleAddtoCart');
        event.preventDefault();
        const button = event.target;
        const productId = button.getAttribute('data-product-id');
           //const quantityId = button.getAttribute('data-quantity-id');
         const quantityContainer = button.closest(".product-item").querySelector('.custom-quantity-input');
         let quantity = 1; // Default quantity
  
           console.log(`######## Quantity Id ${productId}`);
  
       if (quantityContainer) {
            if (quantityContainer.tagName === 'INPUT' || quantityContainer.type === 'number') {
               quantity = quantityContainer.value;
            } else {
               quantity = quantityContainer.value;
            }
         }
        
        addToCart(productId,quantity)
        .then(data => {
          console.log(`Product Added to Cart:`, data);
          updateButtonState(button);
          updateCartCount();
        })
        .catch(error => {
          console.error(`Error Adding product to Cart`, error);
          showErrorModal();
        });
      }
  
    function addToCart(productId,quantity){
        return fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify({
                id: productId,
                quantity: parseInt(quantity, 10) // Ensure quantity is a number
                })
            })
            .then(response => {
                if (!response.ok) {
                return response.json().then(err => {
                    throw err;
                })
                }
            return response.json();
            })
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

    document.addEventListener('click', function(event){
        if(event.target.classList.contains('add-to-cart-button')){
            handleAddToCart(event);
        }
    });


});