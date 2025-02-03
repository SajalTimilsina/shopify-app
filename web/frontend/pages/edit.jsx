// ./pages/edit/[customerName]/[listName].tsx
import React from "react";
import { useParams } from "react-router-dom";

const edit  = () => {
  const { customerName, listName } = useParams();

  return (
    <div>
      <h1>Edit Page</h1>
      <p>Customer Name: {customerName}</p>
      <p>List Name: {listName}</p>
    </div>
  );
};

export default edit;
