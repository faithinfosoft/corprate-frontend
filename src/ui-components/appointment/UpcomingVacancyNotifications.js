import React, { useState, useEffect } from "react";
import axios from "axios";
import NoDataFound from "../NoDataFound.js";
import globalVariables from "../../Global.js";
import Breadcum from "../Breadcum.js";
import { useNavigate } from "react-router-dom";
import useAuth from "../../utilities/useAuth.js";
import { capitalizeWords } from '../../utilities/dateconverter';
const VacancyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Upcoming Vacancy Notifications", Link: "" },
  ]);

  const navigate = useNavigate();
  const auth = useAuth();
  const username = auth.user?.username;
  const usertype = auth.user?.user_type;

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/vacancy/upcoming_vacancy_details`
      );

      if (response.data) {
        const transformedData = [
          { nature_of_vacancy: "obituary", total: response.data.obituary },
          { nature_of_vacancy: "resignation", total: response.data.resignation },
          { nature_of_vacancy: "retirement", total: response.data.retirement },
        ];

        setNotifications(transformedData);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <Breadcum items={breadcum} title="Upcoming Vacancy Notifications" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Upcoming Vacancy Notification Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered  table-striped datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Nature Of Vacancy</th>
                      <th scope="col" className="text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && notifications.filter(item => item.total > 0).length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      notifications
                        .filter(item => item.total > 0) // Filter to show only records where total > 0
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              <a
                                href={`/vacancy/create-vacancy?nature=${encodeURIComponent(item.nature_of_vacancy)}`}
                                className="text-dark"
                              >
                                {capitalizeWords(item.nature_of_vacancy)}
                              </a>
                            </td>
                            <td className="text-center">{item.total}</td>
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

export default VacancyNotifications;
