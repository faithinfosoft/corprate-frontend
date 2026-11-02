import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Breadcum from '../Breadcum';
import axios from 'axios';
import globalVariables from "../../Global.js";
import useAuth from '../../utilities/useAuth';

const AdminDashboard = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const user_type = auth.user.user_type;

  const [zoneCount, setzoneCount] = useState(null);
  const [schoolCount, setschoolCount] = useState(null);
  const [staffCount, setStaffCount] = useState(null);


  const [news, setNews] = useState(null);
  const [ClasslevelCount, setClasslevelCount] = useState(null);
  const [classLevels, setClassLevels] = useState([]);
  const [schoolTypes, setSchoolTypes] = useState([]);

  const [permanent, setPermanent] = useState(null);
  const [temporary, setTemporary] = useState(null);
  const [breadcum, setBreadcum] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Notification states
  const [pendingServiceCount, setPendingServiceCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingTransferCount, setPendingTransferCount] = useState(0);
  const [vacancyCount, setVacancyCount] = useState(0);

  const fetchzoneCount = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/dashboard/get_zone_count');
      if (response.data.status) {
        setzoneCount(response.data.data); // Extract the count value
        //console.log(response.data.data.forane_count);
      } else {
        // Handle the case where response status is false
        console.error('Error fetching zone count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  // Function to truncate text if it exceeds a certain length
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };


  const fetchSchoolCount = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/dashboard/get_school_count');
      if (response.data.status) {
        setschoolCount(response.data.data); // Extract the count value
        //console.log(response.data.data.forane_count);
      } else {
        // Handle the case where response status is false
        console.error('Error fetching zone count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };


  const fetchNews = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/dashboard/get_news');
      if (response.data.status) {
        setNews(response.data.data); // Extract the count value
        //console.log(response.data.data.forane_count);
      } else {
        // Handle the case where response status is false
        console.error('Error fetching zone count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const fetchstaffs = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/dashboard/get_staff_count');
      if (response.data.status) {
        setStaffCount(response.data.data); // Extract permanent and temporary counts

      } else {
        console.error('Error fetching staff count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const fetchClassLevels = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/dashboard/get_school_class_level_count');


      if (response.data.status) {
        // Set the class levels directly from the response
        setClassLevels(response.data.data);
      } else {
        console.error('Error fetching school class level count:', response.data.message);
      }


      setLoaded(true);

    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };


  const fetchSchoolTypes = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/dashboard/get_school_type_count');
      if (response.data && response.data.TTI_count !== undefined) {
        setSchoolTypes(response.data.TTI_count);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching school type data:', error.message);
    }
  };

  const fetchNotificationCounts = async () => {
    try {
      // Pending services
      const serviceRes = await axios.get(`${globalVariables.api_url}/staff/pending-count`, {
        params: { username, user_type }
      });
      if (serviceRes.data.status) setPendingServiceCount(serviceRes.data.pendingCount);

      // Pending Leaves
      const leaveRes = await axios.get(`${globalVariables.api_url}/leave/pending_requests_count`, {
        params: { username, user_type }
      });
      if (leaveRes.data.status) setPendingLeaveCount(leaveRes.data.pendingCount);

      // Pending Transfers
      const transferRes = await axios.get(`${globalVariables.api_url}/staff_transfer/pending_transfer_requests_count`, {
        params: { username, user_type }
      });
      if (transferRes.data.status) setPendingTransferCount(transferRes.data.pendingCount);

      // Vacancies
      const vacancyRes = await axios.get(`${globalVariables.api_url}/vacancy/upcoming_vacancy_notifications`);
      if (vacancyRes.data.total_vacancy !== undefined) setVacancyCount(vacancyRes.data.total_vacancy);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  useEffect(() => {
    fetchzoneCount();
    fetchSchoolCount();
    fetchNews();
    fetchstaffs();
    fetchClassLevels();
    fetchSchoolTypes();
    fetchNotificationCounts();
  }, []);

  return (
    <>
      {/* <Breadcum items={breadcum} title="Dashboard" /> */}
      <section class="section dashboard">
        <div class="row admin_dashboard mt-3 ms-1">

          <div class="col-md-8 col-sm-2">
            <div class="row">



              <div class="col-xxl-4 col-md-6">
                <div class="card info-card sales-card">



                  <div class="card-body">
                    <h5 class="card-title">Zones <span>| Total</span></h5>

                    <div class="d-flex align-items-center">
                      <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-geo-alt-fill"></i>
                      </div>
                      <div class="ps-3">
                        <h6>{zoneCount !== null ? zoneCount : ''}</h6>

                      </div>
                    </div>
                  </div>

                </div>
              </div>


              <div class="col-xxl-4 col-md-6">
                <div class="card info-card revenue-card">



                  <div class="card-body">
                    <h5 class="card-title">Schools <span>| Total</span></h5>

                    <div class="d-flex align-items-center">
                      <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="fa-solid fa-school"></i>
                      </div>
                      <div class="ps-3">
                        <h6>{schoolCount !== null ? schoolCount : ''}</h6>

                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div class="col-xxl-4 col-md-6">

                <div class="card info-card customers-card">



                  <div class="card-body">
                    <h5 class="card-title">Teaching Staff </h5>

                    <div class="d-flex align-items-center">
                      <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-people"></i>
                      </div>
                      <div class="ps-3">
                        <h6>{staffCount && staffCount.teaching_staff_count ? staffCount.teaching_staff_count : '0'}</h6>


                      </div>
                    </div>

                  </div>
                </div>

              </div>
              <div class="col-xxl-4 col-md-6">

                <div class="card info-card staff-card">



                  <div class="card-body">
                    <h5 class="card-title">Non-Teaching Staff </h5>

                    <div class="d-flex align-items-center">
                      <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-people"></i>
                      </div>
                      <div class="ps-3">

                        <h6>{staffCount && staffCount.non_teaching_staff_count ? staffCount.non_teaching_staff_count : '0'}</h6>

                      </div>
                    </div>

                  </div>
                </div>

              </div>






            </div>

          </div>

          <div className="col-md-4 col-sm-2">

            {/* Notifications Card */}
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body">
                <h6 className="card-title text-primary"><i className="bi bi-bell-fill me-2"></i> Action Required & Notifications</h6>
                <div className="list-group list-group-flush mt-3">
                  
                  <Link to="/pendingstaffservice" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 px-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-badge text-info me-3 fs-5"></i>
                      <strong className="text-dark">Pending Staff Services</strong>
                    </div>
                    {pendingServiceCount > 0 ? (
                      <span className="badge bg-danger rounded-pill px-3 py-2">{pendingServiceCount}</span>
                    ) : (
                      <span className="badge bg-light text-dark rounded-pill">0</span>
                    )}
                  </Link>

                  <Link to="/leave-applications" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 px-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-envelope-paper text-warning me-3 fs-5"></i>
                      <strong className="text-dark">Leave Requests</strong>
                    </div>
                    {pendingLeaveCount > 0 ? (
                      <span className="badge bg-danger rounded-pill px-3 py-2">{pendingLeaveCount}</span>
                    ) : (
                      <span className="badge bg-light text-dark rounded-pill">0</span>
                    )}
                  </Link>

                  <Link to="/pending-transfer-applications" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 px-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-arrow-left-right text-success me-3 fs-5"></i>
                      <strong className="text-dark">Transfer Requests</strong>
                    </div>
                    {pendingTransferCount > 0 ? (
                      <span className="badge bg-danger rounded-pill px-3 py-2">{pendingTransferCount}</span>
                    ) : (
                      <span className="badge bg-light text-dark rounded-pill">0</span>
                    )}
                  </Link>

                  <Link to="/vacancy-notifications" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 px-0">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-circle text-danger me-3 fs-5"></i>
                      <strong className="text-dark">Vacancy Notifications</strong>
                    </div>
                    {vacancyCount > 0 ? (
                      <span className="badge bg-danger rounded-pill px-3 py-2">{vacancyCount}</span>
                    ) : (
                      <span className="badge bg-light text-dark rounded-pill">0</span>
                    )}
                  </Link>

                </div>
              </div>
            </div>

            {/* School Stats Card */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 class="card-title">Total Number of Schools by Class Levels</h6>
                <ul className="list-group">
                  {loaded &&
                    classLevels.map((level, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {level.class_level_name}
                        <span className="badge bg-primary rounded-pill">
                          {level.total_schools || 0}
                        </span>
                      </li>
                    ))}
                </ul>



                <div className="row mt-3">
                  <div className="col-md-12">
                    <div className="flex items-center">
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          TTI
                          <span className="badge bg-info rounded-pill">
                            {schoolTypes || 0}  {/* Display TTI count, fallback to 0 */}
                          </span>
                        </li>
                      </ul>

                    </div>
                  </div>
                </div>


              </div>

            </div>

          </div>


        </div>
      </section>


    </>
  );
}

export default AdminDashboard;
