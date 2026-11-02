import React, { useState, useEffect } from "react";
import axios from "axios";
import NoDataFound from "../NoDataFound";
import globalVariables from "../../Global.js";
import Breadcum from "../Breadcum";
import { useNavigate } from "react-router-dom";
import useAuth from "../../utilities/useAuth";

const VacancyDesignation = () => {
  const [vacancyCount, setVacancyCount] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Vacancy Notifications", Link: "" },
  ]);

  const navigate = useNavigate();
  const auth = useAuth();
  const username = auth.user?.username; // Added optional chaining to prevent errors
  const usertype = auth.user?.user_type;

  const fetchVacancyCount = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/vacancy/get_vacancycount_designation`);
        
        if (response.data.status) {
            setVacancyCount(response.data.data); // Assuming 'data' contains the array
        } else {
            setVacancyCount([]); // Empty array if no data
        }

        setLoaded(true);
    } catch (error) {
        console.error("Error fetching vacancy count:", error.message);
        setVacancyCount([]); // Handle errors gracefully
        setLoaded(true);
    }
};


  useEffect(() => {
    fetchVacancyCount();
  }, []);

  return (
    <>
     
      <div className="row">
        <div className="col-12">
          <div className="card">
        
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Designation</th>
                      <th scope="col" className="text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
  {loaded && vacancyCount.length === 0 ? (
    <tr>
      <td colSpan={3}>
        <NoDataFound />
      </td>
    </tr>
  ) : (
    vacancyCount.map((item, index) => (
      <tr key={index}>
        <td className="text-center">{index + 1}</td>
        <td className="text-center">{item.designation_name}</td> {/* Use correct field */}
        <td className="text-center">{item.total}</td> {/* Assuming `total` exists */}
      </tr>
    ))
  )}
</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VacancyDesignation;
