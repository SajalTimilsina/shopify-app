// import Reac, {useState, useEffect} from 'react'
// import './AddProductsTable.css'
// import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

// export function AddProductsTable({onClose, selectedProducts, setSelectedProducts}) {

//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [query, setQuery] = useState({search: '', filterBy: 'title'});
//     const selectedProfession = 'doctor';
//     const currentPage = 1;

//     const fetch = useAuthenticatedFetch();
    

//     useEffect(() => {
//         // fetch the products
//         fetchProductInfo();
//     }, [query]);

//     const handleProductToggle = (products) => {
//         // handle product toggle
//     }

//     // Fetch products for the current page
//     async function fetchProductInfo(search = '') {
//         setLoading(true);
//         let request = await fetch(`/api/products?page=${currentPage}&profession=${selectedProfession}&search=${search}`);
//         let response = await request.json();
//        // setProducts(response.productList);
//         console.log("The producted list: ",response.productList);
//         //setTotalPages(response.totalPages);
//         setLoading(false);

//         // const preselectedProducts = response.productList.flatMap(product => {
    
//         //     return product.variants.filter(varaint => varaint.included).map(varaint => varaint.id);
//         // });
//         //console.log("#############Preselected Products:", preselectedProducts);
//         //setSelectedProducts(preselectedProducts);
//         //selectProductExplicitly(preselectedProducts);
//     }

// return (
//     <div className="modal">
//         <div className='modal-content'>
//             <h2> Select Specific  Variant</h2>
//             <div className="search-controls">
//                 <input 
//                     type="text"
//                     placeholder={`Search by ${query.filterBy}`}
//                     value={query.search}
//                     onChange={(e) => setQuery({...query, search: e.target.value})}
//                     />
//                 <select value  onChange={(e) => setQuery({...query, filterBy: e.target.value})}>
//                     <option value="title">Tille</option>
//                     <option value="sku">SKU</option>
//                 </select>
//             </div>
//             <table className="product-table">
//                 <thead>
//                     <tr>
//                         <th>Select</th>
//                         <th>Title</th>
//                         <th>SKU</th>
//                         <th>Price</th>
//                         <th>Stock</th>
//                         <th>Status</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {products.map((product) => (
//                         <tr key={product.id}>
//                             <td>
//                                 <input 
//                                     type="checkbox"
//                                     checked={selectedProducts.some((p) => p.id === product.id)}
//                                     onChange={() => handleProductToggle(product)}
//                                 />
//                             </td>
//                             <td>{product.title}</td>
//                             <td>{product.sku}</td>
//                             <td>{product.price}</td>
//                             <td>{product.stock || 0}</td>
//                             <td>
//                                 {selectedProducts.some((p) => p.id === product.id) ? "Included" : "Not Included"}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//                 <div className="pagination-controls">
//                     <button>Previous</button>
//                     <button>Next</button>
//                     <button className="close-btn" onClick={onClose}>
//           Close
//         </button>
//                 </div>
//             </table>
//         </div>
//     </div>

// )
   
// }



import React, {useState, useEffect} from 'react'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import './AddProductsTable.css'


export function AddProductsTable({onClose, selectedProducts = [], setSelectedProducts, saveList}) {  

    const [products, setProducts] = useState([]);
    // const [selectedProducts, setSelectedProducts] = useState([]);
    const [pagination, setPagination] = useState({currentPage: 1, totalPages: 1});
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState({search: '', filterBy: 'title'});
    const selectedProfession = 'Test Elmira';
    const currentPage = 3;

    const fetch = useAuthenticatedFetch();

      useEffect(() => {
        fetchProductInfo();
      }, [query, pagination.currentPage]);

          // Fetch products for the current page
    async function fetchProductInfo(search = '') {
        setLoading(true);
        let request = await fetch(`/api/products?page=${pagination.currentPage}&profession=${selectedProfession}&search=${query.search}&filterby=${query.filterBy}`);
        let response = await request.json();
        setProducts(response.productList);
        setPagination({currentPage: response.currentPage, totalPages: response.totalPages});
        //console.log("The producted list: ",response);
        //setTotalPages(response.totalPages);
        setLoading(false);
        setSelectedProducts(prevSelected => {
            const updated = [...prevSelected];
            const preselectedProducts = response.productList.flatMap(product => {
                return product.variants
                    .filter(varaint => varaint.included)
                    .filter(v => !prevSelected.some(p => p.variantId === v.id))
                    .map(varaint => ({variantId: varaint.id, title: product.title, sku: varaint.sku, price: varaint.price, quantity: varaint.quantity ? varaint.quantity : 1}));
            });
            console.log("#############Preselected Products:", preselectedProducts);
            console.log([...updated, ...preselectedProducts]);
            return [...updated, ...preselectedProducts];
        })
    }

      const handleMainCheckboxChange = (productId, e) => {
        //console.log(" HandlemainCheckbox change reached")

        setSelectedProducts((prevSelected) => {

            let updated = [...prevSelected];
            const product = products.find(p => p.id === productId);
           // console.log(" Products: ", products);

            //console.log("Product single: ", product);
            product.variants.map((p) => {
                let data1 = {
                    title: product.title,
                    variantId: p.id,
                    sku: p.sku,
                    quantity: 1,
                    price: p.price
                }

                if(e.target.checked){
                    //selectedProducts.push(data1);
                    //console.log(" ###########   1   ########## ");
                    updated = [...updated, data1]
                    //console.log(` ###: Adding ###: ${JSON.stringify(updated, null, 2)}`);

            
                } else{
                    //console.log(" ###########   2   ########## ");
                    updated = updated.filter((v) => v.variantId !== p.id);
                    //console.log(` ###: Updated ###: ${JSON.stringify(updated, null, 2)}`);
                }
            })
            //console.log("Selected Products: ", updated);
            return updated;
        })
      };

      const handleVariantCheckboxChange = (variantId, e) => {
        //console.log(`${variantId} ---- ${e.target.checked}`);
        
        setSelectedProducts((prevSelected) => {
            // change the previous selected products to array
            //console.log("Previous Selected: ", prevSelected);
            let updated = [...prevSelected];
            // find the product details from the products array
            const product = products.find((p) => p.variants.some((v) => v.id === variantId));
            // find the variant details from the product details
            const variant = product.variants.find((v) => v.id === variantId);

            //check if the selected input value is selected or not
            if(e.target.checked){
                //console.log(" I am inside the checked")
                updated = [...updated, { variantId: variant.id, title: product.title, sku: variant.sku, price: variant.price, quantity: 1}];
            } else {
                //console.log(" I am inside the unchecked")

                // if not selected, remove the variant from the selected products
                updated = updated.filter((p) => p.variantId !== variant.id);
            }
            console.log("### Selected Products: ###", updated);
            return updated;
       
        })

        //console.log("Selected Products: ", selectedProducts);
      };

      const checkBothVariantChecked = (productId) => {

        //console.log("Selected Products: ", selectedProducts);
        const product = products.find(p => p.id === productId);
        //console.log("Product Id: ", productId);

        const data1 = product.variants.map((v) => v.id);
        //console.log("Data1: ", data1);

        const data2 = data1.every((v) => selectedProducts.some((p) => p.variantId === v));
        //console.log("############### Checking two Data2: ", data2);
    }
    
    const handleQuantityChange = (variantId, quantity) => {
        console.log(`${variantId} - ${quantity}`);
        setSelectedProducts((prevSelected) =>{
            const updated = [...prevSelected];
            const index = updated.findIndex((p) => p.variantId === variantId);
            if(index !== -1){
                updated[index].quantity = quantity;
            }
            return updated;
        })
    }


      
  return (
    <div className="modal">
        <div className="modal-content">
            <div className="modal-header">
                <h3>Select Specific Varaints</h3>
                <button className="close-btn" onClick={onClose}> &times; </button>
            </div>
            <div className="search-controls">
                <input
                    type="text"
                    placeholder={`Search by ${query.filterBy}`}
                    value={query.search}
                    onChange={(e) => setQuery({...query, search: e.target.value}) }
                />
                <select 
                    value={query.filterBy}
                    onChange={(e) => setQuery({...query, filterBy: e.target.value})}
                >
                    <option value="title">Title</option>
                    <option value="sku">SKU</option>
                </select>
            </div>
        
            <div className="product-list">
                {products.map((product) => {
                    // const allSelected = product.variants.every((variant) =>
                    //     selectedProducts.includes(variant.sku)
                    //     );
                    //     console.log("All Selected: ", allSelected);
                return(
                    <div key={products.title} className="product-item">
                    {/* if single varaints, show everythingin line. If multiple, show as a header plus variant block */}
                        {product.variants.length > 1 ? (
                            <> 
                                <div className="product-header">
                                    <input type="checkbox" onChange={(e) => handleMainCheckboxChange(product.id, e)} checked={checkBothVariantChecked(product.id)} />
                                    <img src={product.images[0] || 'https://via.placeholder.com/100'} alt={product.id} className="product-image"/>
                                    <div className="product-info">
                                        <h3>{product.title}</h3>
                                        <span>Brand: {product.vendor}</span>
                                        <span>{product.brand}</span>
                                    </div>
                                </div>
                                <div className="product-variants">
                                        {product.variants.map((variant) => (
                                            <div key={variant.sku} className="variant-row">
                                                <input
                                                id={variant.id}
                                                key={variant.id}
                                                type="checkbox"
                                                onChange={(e) => handleVariantCheckboxChange(variant.id, e)}
                                                checked={selectedProducts.some((p) => p.variantId === variant.id)}
                                                />
                                                <span>{variant.title} - SKU: {variant.sku}</span>
                                                <input type="number" value={selectedProducts.find((p) => p.variantId === variant.id)?.quantity || 1} className="quantity-box" onChange={(e) => handleQuantityChange(variant.id, parseInt(e.target.value))}/>
                                                <span className={`stock ${variant?.stock > 0 ? "in-stock" : "out-of-stock"}`}>{variant.stock || ""} in stock</span>
                                                <span>{variant.price} CAD</span>
                                            </div>
                                        ))}
                                </div>

                            </>
                        ) : (
                            // single variant line
                            <div className="single-variant">
                                <input
                                    id={product.variants[0].id}
                                    key={product.variants[0].id}
                                    type="checkbox"
                                    onChange= { (e)=> handleMainCheckboxChange(product.id, e)}
                                    checked={selectedProducts.some((p) => p.variantId === product.variants[0].id)}
                                />
                                <img src={product.images[0] || 'https://placeholder.pics/svg/300'} alt={product.title.substring(0,10)} className="product-image"/>
                                <div className="product-info">
                                    <h3>{product.title}</h3>
                                    <span>Brand: {product.vendor}</span>
                                    <p className="product-sku">SKU: {product.variants[0].sku}</p>
                                </div>
                                <input type="number" value={selectedProducts.find((p) => p.variantId === product.variants[0].id)?.quantity || 1} onChange={(e)=> handleQuantityChange(product.variants[0].id, parseInt(e.target.value))} className="quantity-box"/>
                                <span className={`stock ${product.variants[0].stock > 0 ? "in-stock" : "out-of-stock"}`}> {product.variants[0].stock} in stock</span>
                                <span>{product.variants[0].price} CAD</span>
                            </div>
                        )}
                    </div>
                    )
                })}
            </div>

            <div className="footer">
                <div className="pagination-controls">
                    <button 
                        onClick={()=> setPagination((prev) => ({...prev, currentPage: Math.max(prev.currentPage -1, 1)}))}
                        disable={pagination.currentPage === 1}
                    > Previous</button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button
                        onClick={() => setPagination((prev) => ({...prev, currentPage: Math.min(prev.currentPage +1, pagination.totalPages)}))}
                        disable={pagination.currentPage === pagination.totalPage}
                    >Next</button>
                </div>
                <div className="action">
                    <button className="close-btn" onClick={() => setSelectedProducts([])} >
                        Clear
                    </button>
                    <button className="add-btn" style={{backgroundColor:"red"}} onClick={saveList}>
                        Add
                    </button>
                </div>

            </div>

        </div>
  </div>
  )
}
