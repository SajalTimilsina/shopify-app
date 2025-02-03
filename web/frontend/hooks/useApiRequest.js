import React, { useEffect, useState} from 'react'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

export function useApiRequest(url, method) {

    let fetch = useAuthenticatedFetch();
    let [responseData, setResponseData] = useState(null);
    let [isLoading, setLoading] = useState(true);
    let [error, setError] = useState("");

    useEffect(()=>{

      let abortController = new AbortController();
        fetch(url, {
            method: `${method}`,
            header: {"Content-type": "application/json"},
            signal: abortController.signal
        })
        .then((respose)=>{
          if(!respose.ok){
            setError(`Error: ${respose.status}`);
          }
          return respose.json();
        }).then(data => {
          setResponseData(data);
          setLoading(false);
        })
        .catch((error) => {
          if(error.name === 'AbortError'){
            console.log("Abort Error");
          }else{
            console.log(error.name, "=>", error.message);
          }
        })
        return() => abortController.abort();
    },[url]);

    return{responseData, isLoading, error};
}
