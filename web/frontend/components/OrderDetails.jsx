import { Layout, LegacyCard } from '@shopify/polaris'
import React from 'react'

export function OrderDetails() {
  return (
   <>
   <Layout>
    <Layout.Section>
        <LegacyCard title="Order Details">
            <p className='text-medium'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime ducimus voluptatum veritatis, a quibusdam animi eveniet, quod illo minus impedit ea iusto vitae doloremque eaque culpa delectus esse, cupiditate minima!</p>
        </LegacyCard>
    </Layout.Section>
    </Layout></>
  )
}

