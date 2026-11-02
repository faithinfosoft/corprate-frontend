import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import globalVariables from "../../Global.js";
import useAuth from "../../utilities/useAuth";
import { Modal } from "react-bootstrap";
import { useRef } from "react";

// Default avatar SVG as a data URI to ensure it always loads
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const StaffDashboard = () => {
  const marqueeRef = useRef(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const staff_id = auth?.user?.user_id || null;
  const username = auth.user.username;
  const [staffDetails, setStaffDetails] = useState({});
  const [news, setNews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const [descriptionModalIsOpen, setDescriptionModalIsOpen] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCreated, setCurrentCreated] = useState("");
  const [imgSrc, setImgSrc] = useState(defaultAvatar);

  useEffect(() => {
    localStorage.setItem("lastVisitedPage", "/");
  }, []);

  useEffect(() => {
    if (!staff_id) return;
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/news/get-school-news`,
          {
            params: { staff_id },
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.data.status) {
          setNews(
            response.data.data.sort(
              (a, b) => new Date(b.created_date) - new Date(a.created_date)
            )
          );
        }
        setLoaded(true);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchNews();
  }, [staff_id]);


  const handleDescription = (image, title, createddate, type, description) => {
    setCurrentCreated(createddate);
    setCurrentTitle(title);
    setCurrentImage(image);
    setCurrentDescription(description);
    setDescriptionModalIsOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  const [recentNotifications, setNotifications] = useState([]);

  const fetchstaff = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/staff/staff_email`,
        { params: { username: username } }
      );

      if (response.data.status) {
        setStaffDetails(response.data.data);
        if (response.data.data.photo) {
            setImgSrc(`${globalVariables.img_url}/uploads/staff_photos/${response.data.data.photo}`);
        }
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchstaff();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/schoolnotification/view_staff_notifications`, {
        params: { email: username }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const formatDatee = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <div className="container-fluid pt-0 pb-4 px-3" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        
        {/* Welcome Header */}
        <div className="row mb-0">
          <div className="col-12">
            <div className="card rounded-3 border-0 shadow-sm overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #004d99 0%, #007bff 100%)' }}>
              <div className="card-body p-3 d-flex justify-content-between align-items-center position-relative">
                <div className="position-absolute top-0 end-0 bottom-0 start-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at right, rgba(255,255,255,0.2) 0%, transparent 50%)' }}></div>
                <div className="position-relative z-1">
                  <h4 className="fw-bold mb-1">
                    Welcome to Corporate Management of Schools
                  </h4>
                  <p className="mb-0 small text-white-50 fw-medium">
                    Dashboard &nbsp;|&nbsp; Staff Portal
                  </p>
                </div>
                <div className="text-end d-none d-md-block position-relative z-1">
                  <span className="small d-block text-white-50 fw-medium">Current Date</span>
                  <strong className="fs-6">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash News Ticker */}
        {loaded && news.length > 0 && (
            <div className="row mb-2">
                <div className="col-12">
                    <div className="card rounded-3 border-0 shadow-sm overflow-hidden bg-white">
                        <div className="d-flex align-items-center" style={{ height: '40px' }}>
                            <div className="text-white px-4 py-2 fw-bold d-flex align-items-center h-100 shadow-sm" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #e85d04 100%)' }}>
                                <i className="bi bi-lightning-charge-fill me-2 fs-5"></i> Flash News
                            </div>
                            <div className="flex-grow-1 overflow-hidden px-3">
                                <marquee
                                    ref={marqueeRef} scrollamount="4"
                                    onMouseEnter={() => marqueeRef.current && marqueeRef.current.stop()}
                                    onMouseLeave={() => marqueeRef.current && marqueeRef.current.start()}
                                >
                                    <div className="d-flex align-items-center text-dark small py-1">
                                        {news.map((item, index) => (
                                            <span
                                            key={index}
                                            onClick={() => handleDescription(item.news_image, item.news_title, item.news_posted_date, item.news_type, item.news_description)}
                                            className="me-5 text-dark cursor-pointer text-decoration-none hover-primary fw-medium"
                                            >
                                                <span className="badge text-danger border border-danger-subtle me-2 rounded-pill shadow-sm" style={{ backgroundColor: '#fff5f5' }}>
                                                    {item.zone_details_name}
                                                </span>
                                                {item.news_title}
                                            </span>
                                        ))}
                                    </div>
                                </marquee>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Widgets Grid */}
        <div className="row g-4">
          
          {/* Left Column: Profile Widget */}
          <div className="col-lg-4 col-md-5">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 widget-hover" style={{ background: 'linear-gradient(180deg, #e0e7ff 0%, #f5f3ff 100%)', borderTop: '4px solid #6366f1' }}>
              <div className="text-center mb-4">
                <div className="d-inline-block position-relative mb-3">
                  <img
                    src={imgSrc}
                    onError={() => setImgSrc(defaultAvatar)}
                    alt="Profile"
                    className="rounded-circle shadow"
                    style={{ width: '110px', height: '110px', objectFit: 'cover', border: '4px solid #ffffff' }}
                  />
                  <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white shadow-sm" style={{ width: '22px', height: '22px' }}></div>
                </div>
                <h5 className="fw-bold text-dark mb-1">{staffDetails.staff_official_name || "Staff Member"}</h5>
                <span className="badge px-3 py-1 rounded-pill fw-medium text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                  Staff Profile
                </span>
              </div>
              
              <div className="mt-auto">
                <div className="widget-item mb-2 p-3 rounded-4 d-flex align-items-center bg-white shadow-sm" style={{ transition: 'all 0.2s' }}>
                  <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e0f2fe', width: '40px', height: '40px' }}><i className="bi bi-envelope text-info fs-5"></i></div>
                  <div className="overflow-hidden">
                    <div className="small text-muted mb-0 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Email Address</div>
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>{staffDetails.email || "N/A"}</div>
                  </div>
                </div>
                <div className="widget-item mb-2 p-3 rounded-4 d-flex align-items-center bg-white shadow-sm" style={{ transition: 'all 0.2s' }}>
                  <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#dcfce7', width: '40px', height: '40px' }}><i className="bi bi-telephone text-success fs-5"></i></div>
                  <div>
                    <div className="small text-muted mb-0 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Phone Number</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{staffDetails.phone_no1 || "N/A"}</div>
                  </div>
                </div>
                <div className="widget-item p-3 rounded-4 d-flex align-items-center bg-white shadow-sm" style={{ transition: 'all 0.2s' }}>
                  <div className="p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', width: '40px', height: '40px' }}><i className="bi bi-gender-ambiguous text-purple fs-5" style={{ color: '#9333ea' }}></i></div>
                  <div>
                    <div className="small text-muted mb-0 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Gender</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{staffDetails.gender || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: School Info Widgets */}
          <div className="col-lg-4 col-md-7">
            <div className="row g-4">
                {/* Combined School Info Widget */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 widget-hover" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', borderLeft: '4px solid #0ea5e9' }}>
                        <div className="d-flex align-items-center mb-4 pb-4 border-bottom border-primary border-opacity-25">
                            <div className="bg-primary text-white p-3 rounded-4 me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                <i className="bi bi-building fs-3"></i>
                            </div>
                            <div>
                                <h6 className="text-primary opacity-75 mb-0 fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Current School</h6>
                                <h4 className="fw-bolder text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>{staffDetails.school_name || "Unassigned"}</h4>
                            </div>
                        </div>

                        <div className="text-muted small fw-bold mb-2 text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}><i className="bi bi-geo-alt text-primary me-2"></i>School Address</div>
                        <div className="fw-bold text-dark fs-6 mb-4">{staffDetails.address || "No address provided."}</div>
                        
                        <div className="d-flex flex-wrap gap-3 mt-auto">
                            <div className="p-3 rounded-4 flex-grow-1 bg-white bg-opacity-75 shadow-sm">
                                <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}><i className="bi bi-telephone text-success me-1"></i> School Phone</div>
                                <div className="fw-bold text-dark">{staffDetails.phone || "N/A"}</div>
                            </div>
                            <div className="p-3 rounded-4 flex-grow-1 bg-white bg-opacity-75 shadow-sm">
                                <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}><i className="bi bi-envelope text-info me-1"></i> School Email</div>
                                <div className="fw-bold text-dark">{staffDetails.school_email || "N/A"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column - Notifications Widget */}
          <div className="col-lg-4 col-md-12">
            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column widget-hover" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)', borderTop: '4px solid #f59e0b' }}>
              <div className="p-4 border-bottom border-warning border-opacity-25 d-flex justify-content-between align-items-center bg-white bg-opacity-50 rounded-top-4">
                <h6 className="fw-bold text-dark mb-0">Notifications</h6>
                {recentNotifications.length > 0 && (
                    <span className="badge text-dark rounded-pill shadow-sm" style={{ backgroundColor: '#fcd34d', border: '1px solid #fbbf24' }}>
                        {recentNotifications.length} New
                    </span>
                )}
              </div>

              <div className="card-body p-0 overflow-auto" style={{ maxHeight: '450px' }}>
                {recentNotifications.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentNotifications.map(notification => (
                      <div key={notification.id} className="list-group-item p-4 border-bottom border-warning border-opacity-25 bg-transparent widget-notification" style={{ transition: 'all 0.2s' }}>
                        <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                          <strong className="text-dark fs-6">{notification.title}</strong>
                        </div>
                        <p className="mb-2 text-muted small lh-base">
                          {notification.description.replace(/<\/?[^>]+(>|$)/g, "")}
                        </p>
                        <span className="text-muted fw-medium d-inline-flex align-items-center bg-white px-2 py-1 rounded shadow-sm" style={{ fontSize: '11px' }}>
                          <i className="bi bi-clock me-1 text-warning"></i>
                          {formatDatee(notification.posted_date)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '70px', height: '70px' }}>
                        <i className="bi bi-bell text-warning fs-2"></i>
                    </div>
                    <p className="text-muted fw-medium small mb-0">No new notifications</p>
                  </div>
                )}
              </div>

              <div className="p-3 text-center border-top border-warning border-opacity-25 mt-auto bg-white bg-opacity-50 rounded-bottom-4">
                <Link to="/staffviewnotification" className="text-decoration-none fw-bold text-warning-emphasis small hover-primary d-inline-block py-1">
                  View All Activity <i className="bi bi-chevron-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Modal show={descriptionModalIsOpen} onHide={() => setDescriptionModalIsOpen(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
        </Modal.Header>
        <Modal.Body className="px-5 pt-2 pb-4">
          <div className="mb-4 text-center">
             <h4 className="text-dark fw-bold mb-4" dangerouslySetInnerHTML={{ __html: currentTitle }} />
             {currentImage && (
               <div className="text-center bg-light p-3 rounded-4 mb-4 d-inline-block shadow-sm">
                 <img src={currentImage} alt="News" className="img-fluid rounded-3" style={{ maxHeight: "250px", objectFit: "contain" }} /> 
               </div>
             )}
          </div>
          <div className="text-secondary lh-lg" dangerouslySetInnerHTML={{ __html: currentDescription }} />
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light px-5 py-3 d-flex justify-content-between rounded-bottom">
          <span className="text-muted small fw-medium">
            <i className="bi bi-calendar2 me-2 text-primary"></i>{formatDate(currentCreated)}
          </span>
          <button className="btn btn-dark rounded-pill px-4 shadow-sm" onClick={() => setDescriptionModalIsOpen(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .cursor-pointer { cursor: pointer; }
        .hover-primary:hover { color: #0d6efd !important; text-decoration: underline !important; }
        .widget-hover { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .widget-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(0,0,0,.15)!important; }
        .widget-notification:hover { background-color: #f8fafc; }
        .widget-item:hover { background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; }
      `}</style>
    </>
  );
};

export default StaffDashboard;
