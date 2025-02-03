import React, { useState, useEffect } from "react";
import "./MasterListTable.css";
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useNavigate } from "react-router-dom";


export function MasterListTable() {
    const [rules, setRules] = useState([]);

    const fetch = useAuthenticatedFetch();
    const nagivate = useNavigate();

    useEffect(() => {
        
        async function fetchFavoriteList(){
            const response = await fetch(`/api/profession/flist`);
            const data = await response.json();
            console.log(` ######################################################`);
            console.log(`### Data List name: ${JSON.stringify(data,null, 2)} `);
            setRules( prevRules => [...prevRules, ...data]);
        }
        fetchFavoriteList();
    },[]);

    const handleEdit = (customerName,listName) => {
        console.log("Edit clicked", customerName, listName);
        nagivate(`/edit/${customerName}/${listName}`);
    }

    return (
        <div className="config-container">
            <h2>List Table</h2>
            <button className="add-rule-btn">Add Rule</button>
            <table className="config-table">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Customer</th>
                        <th>List Name</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created Date</th>
                        <th>Updated Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rules.map((rule, index) => (
                        <tr key={index}>
                            <td><input type="checkbox" /></td>
                            <td>{rule.customerName}</td>
                            <td>{rule.listName}</td>
                            <td><span className={`status-badge ${rule.status === "enable" ? "enable" : "disable"}`}>{rule.status}</span></td>
                            <td>{rule.priority}</td>
                            <td>{rule.cDate}</td>
                            <td>{rule.uDate}</td>
                            <td>
                                <button className="config-button" onClick = {() => handleEdit(rule.customerName,rule.listName)}>Edit</button>
                                <button className="config-button">Duplicate</button>
                                <button className="config-button">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}