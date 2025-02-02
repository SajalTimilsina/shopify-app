
document.addEventListener("DOMContentLoaded", function() {



const saveCatButton = document.querySelector('.savecart_button');

if(saveCatButton){

    saveCatButton.addEventListener('click', function() {
        getCart().then(data =>{
            console.log(data);

            if(data.items.length > 0){
                
                const cartData = {
                    "products" : data.items.map(item => {
                        return {
                            "id": item.variant_id,
                            "quantity": item.quantity
                        }
                    })
                };

                fetch(`${location.origin}/apps/proxy-1/savecart/${meta.page.customerId}?shop=${Shopify.shop}/`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cartData)
                })
                .then(response => {
                    if(!response.ok) {
                        throw new Error(`Network response was not ok: ${response}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success Kirti Prasad:', data);
                })

            }else{
                alert("Cart is empty");
            }
        })
    })
}

    const button = document.querySelector('.buynow_button');
    const cartData = {
        "products": [{
            "id": "123",
            "quantity": 1
        }]
    };
    const customerId = meta.page.customerId;
    const cartValue= localStorage.getItem('cart');
 
    console.log(cartValue);
    console.log(button);

    if(button) {
        button.addEventListener('click', function() {

            getCart().then(data => {

                if(data.items.length === 0) {
                    alert("Cart is empty");
                    return;
                }
                const cartData ={ 
                    customerId: customerId,
                    shop: Shopify.shop, 
                    cart: data};

                fetch(`${location.origin}/apps/proxy-1/checkout/${customerId}?shop=${Shopify.shop}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cartData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                
            });



        });
    }
})


function getCart(){
    return new Promise((resolve, reject) => {
        fetch(`${location.origin}/cart.js`)
        .then(response => response.json())
        .then(data => {
            resolve(data);
        });
    })
}

console.log("checkout-bnp.js loaded");