import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';
import axios from 'axios';
import globalVariables from "../../Global.js";
import { convertDateFormat } from '../../utilities/dateconverter.js';
const SchoolManagerDashboard = () => {
  const [breadcum, setBreadcum] = useState([]);
  const [staffDetails, setStaffDetails] = useState({});
  const auth = useAuth();
  const username = auth.user.username;
  const [loaded, setLoaded] = useState(false);
  const [quickLinks, setQuickLinks] = useState([
    //  { id: 1, title: "Staff Directory", icon: "fas fa-users", url: "/staff-directory" },
    { id: 2, title: "Staff Leave Records", icon: "fas fa-chalkboard-teacher", url: "/approved-leave-applications" },
    { id: 3, title: "Staff Transfer Records", icon: "fas fa-calendar-alt", url: "/approved-transfer-applications" },

  ]);


  // Simulated function for handling notification dismissal

  const fetchstaff = async () => {
    try {


      const response = await axios.get(
        `${globalVariables.api_url}/schoolmanager/get_manager_username`,
        {
          params: {
            username: username,
          },
        }
      );
      if (response.data.status) {
        setStaffDetails(response.data.data);

      } else {
        console.error('Error fetching staff count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchstaff();
  }, []);


  return (
    <>
      {/* <Breadcum items={breadcum} title="Dashboard" /> */}
      <div className="container">
        {/* Welcome Banner */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-info">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="text-white"> Welcome to Corporate Management of Schools</h3>
                    <p className="text-white mb-0">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    {/* Empty div for layout balance */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* School Details and Overview Cards */}
        <div className="row g-3">
          {/* School Details Card */}
          <div className="col-md-5">
            <div className="card card-info card-outline">
              <div className="card-body box-profile">
                <h5 className="text-dark text-center">
                  <strong>{staffDetails.official_name}</strong>
                </h5>
                <p className="text-dark text-center" style={{ marginTop: '-11px' }}>
                  School Manager
                </p>
                <ul className="list-group list-group-unbordered mb-3">
                  <li className="list-group-item">
                    <b>Current School : </b> <a className="float-right text-dark">{staffDetails.school_name}</a>
                  </li>
                  <li className="list-group-item">
                    <b>Start Date : </b> <a className="float-right text-dark">{convertDateFormat(staffDetails.start_date)}</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* About Me Box */}
            <div className="card card-info">
              <div className="card-header">
                <h3 className="card-title">About School</h3>
              </div>
              <div className="card-body">
                <strong>
                  <i className="fas fa-book mr-1"></i> Contact Address
                </strong>
                <p className="text-dark">
                  {staffDetails.address}
                </p>
                <hr />
                <strong>
                  <i className="fas fa-pencil-alt mr-1"></i> Phone
                </strong>
                <p className="text-dark">{staffDetails.school_phone}</p>
                <hr />
                <strong>
                  <i className="fas fa-map-marker-alt mr-1"></i> Email
                </strong>
                <p className="text-dark">{staffDetails.school_email}</p>
              </div>
            </div>
          </div>

          {/* Right column could be used for additional content */}
          <div className="col-md-7">
            <div className="card card-info">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-link mr-2"></i> Quick Links
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {quickLinks.map(link => (
                    <div key={link.id} className="col-md-5 col-sm-6 mb-3">
                      <a
                        href={link.url}
                        className="btn d-flex align-items-center p-3 w-100"
                        style={{
                          fontWeight: "600",
                          fontSize: "16px",
                          textDecoration: "none",
                          borderRadius: "8px",
                          backgroundColor: "#17a2b8",
                          color: "white",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#138496"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#17a2b8"}
                      >
                        <i className={`${link.icon} mr-3 p-1`} style={{ fontSize: "24px" }}></i>
                        <span>{link.title}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SchoolManagerDashboard;