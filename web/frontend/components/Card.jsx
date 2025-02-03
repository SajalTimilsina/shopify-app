import { Layout, LegacyCard } from '@shopify/polaris'
import React from 'react'

export function Card({title, data, productCard, collectionsCard, ordersCard,fulfilledCard, remainsCard}) {
  return (
    <>
        <Layout.Section oneThird>
            <LegacyCard title ={title} sectioned >
                <h2>{productCard && data}
                  {collectionsCard && data}
                  {ordersCard && data}
                  {fulfilledCard && data}
                  {remainsCard && data}
                </h2>   
            </LegacyCard>
        </Layout.Section>
    </>
  )
}
