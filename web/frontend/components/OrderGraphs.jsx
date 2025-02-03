import React from 'react'
import { useState } from 'react';
import {
  Layout,
  LegacyCard,
} from "@shopify/polaris";
import {storeData } from "../data";
import { Chart as ChartJS} from "chart.js/auto";
import {Line, Bar, Doughnut } from "react-chartjs-2";

export function OrderGraphs() {
  
  let [data, setData] = useState({
    labels: storeData.map((d)=> d.year),
    datasets: [{
      label: "Order Details",
      data: storeData.map((d)=> d.order),
    }]
  });

  return (
    <>
    <Layout>
      <Layout.Section oneHalf>
          <LegacyCard title="Total Order" sectioned>
              <Line data ={data} OPTIONS={{responsive: true, maintainAspectRatio: false}}/> 
          </LegacyCard>
      </Layout.Section>
      <Layout.Section oneThird>
        <LegacyCard title="Completed Order" sectioned>
          <Doughnut data={data} />
        </LegacyCard>

    </Layout.Section>
    <Layout.Section oneThird>
      <LegacyCard title="Remaining Order" sectioned>
      <Bar data={data}/>
      </LegacyCard>
    
      </Layout.Section>

  </Layout>
  </>
  )
}