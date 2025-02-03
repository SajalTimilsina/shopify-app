import React from "react";
import { useNavigate } from "react-router-dom";
import "./Gobackbutton.css";

export function Gobackbutton() {
    const navigate = useNavigate();
  return (
    <button className="go-back-btn" onClick={() => navigate(-1)}>
        &#8592; Go Back
    </button>
  );
}