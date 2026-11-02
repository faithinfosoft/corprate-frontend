import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";

const VincentTable = ({ category_id, onDataStatus }) => {
  const [tableData, setTableData] = useState([]);
  const [briefDescription, setBriefDescription] = useState(""); 

  useEffect(() => {
    if (category_id) {
      fetchEvaluationData(category_id);
    }
  }, [category_id]);

  const fetchEvaluationData = async (categoryId) => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/get_Vincent_data?category_id=${categoryId}`
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        setTableData(response.data);
        // Use construction_remarks for brief description
        setBriefDescription(response.data[0].construction_remarks || "No brief description available");

        if (onDataStatus) {
          onDataStatus(true);
        }

      } else {
        setTableData([]);
        setBriefDescription("No brief description available");

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
        <div className="card-header">
          <h5 className="card-title">Brief Description of Activities: {briefDescription}</h5> 
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">Sl.No</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Amount</th>
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
                      <td>{row.activity_data}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VincentTable;
