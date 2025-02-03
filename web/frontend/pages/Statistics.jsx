import React, { useEffect, useState, useCallback } from 'react';
import { MasterListTable } from '../components';
import { PriceListTable } from '../components';



function Statistics() {

  
  return (
    <div>
      <p> Statistics</p>
      <MasterListTable />
      <PriceListTable />
  </div>
  )
}

export default Statistics;