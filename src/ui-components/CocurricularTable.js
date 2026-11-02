import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";

const CocurricularTable = ({ category_id, onDataStatus }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    console.log("Category ID:", category_id); 
    if (category_id) {
      fetchEvaluationData(category_id);
    }
  }, [category_id]);

  const fetchEvaluationData = async (categoryId) => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/get_cocurricular_data?category_id=${categoryId}`
      );

      const fetchedData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setTableData(fetchedData);

      if (fetchedData.length > 0 && onDataStatus) {
        onDataStatus(true);
      } else {
        setTableData([]);
        if (onDataStatus) onDataStatus(false);
      }
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      print_toast("error", "Failed to fetch evaluation data");
      setTableData([]);
      if (onDataStatus) onDataStatus(false);
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
                  <th scope="col">Enrolled Strength</th>
                  <th scope="col">Achievements</th>
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
                      <td>{row.enrolled_strength}</td>
                      <td>{row.achievements}</td>
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

export default CocurricularTable;
