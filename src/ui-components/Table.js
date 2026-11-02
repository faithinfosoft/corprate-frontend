import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import { capitalizeWords } from '../utilities/dateconverter';
import useAuth from "../utilities/useAuth";
const Table = ({ docID,category_id, onDataStatus }) => {
  const auth = useAuth();
  const school_id = auth.user.user_id;
  const [tableData, setTableData] = useState([]);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (category_id) {
      fetchEvaluationData(category_id);
    }
  }, [category_id]);

  const fetchEvaluationData = async (categoryId) => {
    try {
      // const response = await axios.get(
      //   `${globalVariables.api_url}/schoolinfrastructure/fetchData?category_id=${categoryId}`
      // );

      const response = await axios.get(
        `${globalVariables.api_url}/schoolinfrastructure/fetchData`, 
        {
          params: {
            docID:docID,
            category_id: categoryId,
            school_id: school_id
          }
        }
      );
  
      if (Array.isArray(response.data) && response.data.length > 0) {
        setTableData(response.data);
        setRemarks(response.data[0].construction_remarks || "No remarks available");
        
        
        if (onDataStatus) {
          onDataStatus(true); 
        }
  
      } else {
        setTableData([]); 
        setRemarks("No remarks available");
  
        if (onDataStatus) {
          onDataStatus(false); 
        }
      }
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      print_toast("error", "Failed to fetch evaluation data");
  
      if (onDataStatus) {
        onDataStatus(false);
      }
    }
  };
  

  return (
    <div className="col-lg-12">
      <div className="card">
        
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th scope="col">Sl.No</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Yes/No</th>
                  <th scope="col">Item Capacity</th>
                  <th scope="col">Measurement Values</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.item_name}</td>
                      <td>{capitalizeWords(row.item_value)}</td>
                      <td>{row.item_capacity}</td>
                      <td>{row.measurement_values}</td>
                      {/* <td>
  {row.item_capacity === 'yes' ? row.measurement_values : null}
</td> */}
                    </tr>
                   
                  ))
                 
                )}
                 <tr>
                 <td >Constructions During This Year : </td>
      <td colSpan="4" className="text-center">{remarks}</td>
    </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
