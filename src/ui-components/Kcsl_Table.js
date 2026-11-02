import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";

const Kcsl_Table = ({ category_id, onDataStatus }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (category_id) {
      fetchEvaluationData(category_id);
    }
  }, [category_id]);

  const fetchEvaluationData = async (categoryId) => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/Get_Kcsl_data?category_id=${categoryId}`
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        setTableData(response.data);

        if (onDataStatus) {
          onDataStatus(true);
        }
      } else {
        setTableData([]);

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
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">Sl.No</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Previous Year</th>
                  <th scope="col">Current Year</th>
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
                      <td>{row.previousYear}</td>
                      <td>{row.currentYear}</td>
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

export default Kcsl_Table;
