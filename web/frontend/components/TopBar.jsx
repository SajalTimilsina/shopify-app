
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from '../hooks';
export function TopBar() {

  let fetch = useAuthenticatedFetch();
  let [storeName, setStoreName] = useState("");

  useEffect(()=>{

    async function fetchData() {
      try{
        let request = await fetch("api/store/info",{
          method: "GET",
          headers: {"Content-Type": "application/json"}
        });
        let response = await request.json();
        console.log(response);
        setStoreName(response.data[0].name);
      }catch(error){
        console.log(error);
      }
    }

    fetchData();

  },[])



  return (
    <div className='topbar-section'>
        <div className='logo-block'>
            <img className="logo" src = "../assets/emerdepot-logo.png" alt="logo image" />
            <h1 className='text-bold h4'> {storeName}</h1>
            <NavLink to="/"> Sales</NavLink>
            <NavLink to ="/products">Products </NavLink>
        </div>
    </div>
  )
}
