import {
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  LegacyCard,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { OrderGraphs, Card, OrderDetails} from "../components";
import { trophyImage } from "../assets";
import { useAuthenticatedFetch } from "../hooks";
import { useEffect, useState } from "react";

export default function HomePage() {


    let fetch = useAuthenticatedFetch();
    let [products, setProducts] = useState(0);
    let [collections, setCollections] = useState(0);
    let [orders, setOrders] = useState(0);
    let [fulfilled, setFulfilled] = useState(0);
    let [remains, setRemains] = useState(0);

    async function fetchCustomer() {
      try{
        let request = await fetch("/api/getcustomer");
        let response = await request.json();
        setProducts(response.count);
        console.log(response);

      }catch(error){
        console.log(error);
      }
    }

    async function fetchProducts() {
      try{
        let request = await fetch("/api/products/count");
        let response = await request.json();
        setProducts(response.count);
        console.log(response);

      }catch(error){
        console.log(error);
      }
    }

    async function fetchCollection() {
      try{
        let request = await fetch("/api/collections/count");
        let response = await request.json();
        //setProducts(response.count);
        setCollections(response.count);
        console.log(response);
      }catch(error){
        console.log(error);
      }
    }

    async function fetchOrder() {
      try{
        let request = await fetch("/api/orders/all");
        let response = await request.json();
        setOrders(response.data.length);
        console.log(response);
        let fulfilledOrders = response.data.filter(item => item.fulfillment_status === 'fulfilled');
        setFulfilled(fulfilledOrders.length);
        setRemains(response.data.length - fulfilledOrders.length);
        console.log(`Total orders ${response.data.length}, fulfilled orders ${fulfilledOrders.length}`);
      }catch(error){
        console.log(error);
      }
    }

    useEffect(()=>{
        fetchProducts();
        fetchCollection();
        fetchOrder();
        fetchCustomer();
        if(fetchCustomer){
          console.log("Customer fetched");
        }
    },[])

  const { t } = useTranslation();
  return (
    <Page fullWidth>
      <div className="home-section">
        <div className="graphs-section">
          <OrderGraphs />
        </div>
        <div className="cards-section">
            <Layout>
              <Card title="Total Orders" data={orders} ordersCard/>
              <Card title="Fulfilled Orders" data={fulfilled} fulfilledCard/>
              <Card title="Remains Orders" data={remains} remainsCard />
              <Card title="Total Products" data={products} productCard/>
              <Card title="Total Collections" data={collections} collectionsCard/>
            </Layout>
        </div>
        <div className="order-details-section">
          <OrderDetails />
        </div>
        </div>
    </Page>
  );
}
