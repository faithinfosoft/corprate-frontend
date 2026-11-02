import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Modal from "react-bootstrap/Modal";
import "react-datepicker/dist/react-datepicker.css";
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import useAuth from "../utilities/useAuth";
import Breadcum from "./Breadcum";
import NoDataFound from "./NoDataFound";
import { Link } from "react-router-dom";
import { convertDateFormat } from '../utilities/dateconverter';
import { useNavigate} from 'react-router-dom';

const StaffPromotionRequests = () => {
  const navigate = useNavigate();
  const [Promotions, setPromotions] = useState([]);
  const auth = useAuth();
  const { username, user_id } = auth.user;
  const school_id = auth.user.school_id;
  const [loaded, setLoaded] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'My Promotion Requests', Link: '' },
  ]);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    Promotion_id: "",
    fk_staff_id: user_id,
    fk_school_id: school_id,
    start_date: new Date(),
    end_date: new Date(),
    no_of_days: 1,
    nature_of_Promotion: "",
    Promotion_type: "Personal Affairs",
    medical_certificate_file: null,
    reason_of_Promotion: "",
    Promotion_status: "Pending",
    created_by: username,
    approved_on: null,
    approved_by: null,
    remarks: "",
    department_office_section:'',
    pay:'',
    scale_of_pay:'',

  });



  const handleSendLetter = (Promotion) => {
    // Redirect to the desired page with the Promotion ID or details
    navigate(`/staff-promotion-application/${Promotion.promotion_detail_id}`, { state: { PromotionData: Promotion } });
  };





  const fetchPromotions = useCallback(async () => {
    if (!user_id) return; // Avoid making API calls if user_id is not defined
    
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/promotion/view_promotion/${user_id}`
      );

      if (response.data.status) {
        setPromotions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Promotions:", error);
      // print_toast("error", "Failed to fetch Promotions");
    } finally {
      setLoaded(true);
    }
  }, [user_id]);

useEffect(() => {
    fetchPromotions();
}, [fetchPromotions]); // Added fetchPromotions to the dependency array


 

 
const handleEditClick = (Promotion) => {
    console.log("Promotion object:", Promotion);
    navigate(`/staff-promotion-edit-form/${Promotion.promotion_detail_id}`);
  };




  const handleDelete = async (promotionId) => {
    if (!window.confirm("Are you sure you want to delete this Promotion request?")) return;

    try {
        const response = await axios.delete(`${globalVariables.api_url}/promotion/delete`, {
            data: { promotion_id: promotionId }  // Ensure the backend expects data like this
        });

        if (response.data.status) {
            print_toast("success", response.data.message);

            setPromotions((prevPromotions) => 
                prevPromotions.filter(promotion => promotion.promotion_id !== promotionId)
            );

            await fetchPromotions(); // Refresh the list after deletion
        } else {
            print_toast("error", response.data.message);
        }
    } catch (error) {
        console.error("Error deleting Promotion request:", error);
        print_toast("error", "Failed to delete Promotion request");
    }
};


  

  return (
    <>
      <Breadcum items={breadcum} title="My Promotion Requests" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Promotion Request History</h5>
             <Link to="/staff-promotion-request" style={{ color: 'white', textDecoration: 'none' }} className="btn btn-danger">
                 Apply Promotion Request
               </Link>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Staff Name</th>
                      <th scope="col" className="text-center">Created Date</th>
                      <th scope="col" className="text-center">Status</th>
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
  {loaded && Promotions.length === 0 ? (
    <tr>
      <td colSpan="5">
        <NoDataFound />
      </td>
    </tr>
  ) : (
    Promotions.map((Promotion, index) => {
      // Define row color based on Promotion status
      let rowStyle = {};
      if (Promotion.Promotion_status === 'Approved') {
        rowStyle = { backgroundColor: '#d4edda' }; // Light green
      } else if (Promotion.Promotion_status === 'Rejected') {
        rowStyle = { backgroundColor: '#f8d7da' }; // Light red
      } else if (Promotion.Promotion_status === 'Pending') {
        rowStyle = { backgroundColor: '#fff3cd' }; // Light yellow
      }

      return (
        <tr key={Promotion.Promotion_id} style={rowStyle}>
          <td className="text-center">{index + 1}</td>
         
          <td className="text-center">{Promotion.staff_official_name	}</td>
          <td className="text-center">{Promotion.created_on	}</td>
          <td className="text-center">{Promotion.request_status	}</td>
      
          <td className="text-center">
            <div className="dropdown">
              <button
                className="btn btn-dark dropdown-toggle"
                type="button"
                id={`dropdownMenuButton${index}`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Action
              </button>
              <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${index}`}>
              {Promotion.request_letter_status === "draft" && (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleEditClick(Promotion)}
                      >
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleDelete(Promotion.promotion_detail_id)}
                      >
                        Delete
                      </button>
                    </li>
                  </>
                )}
                    {
  Promotion.request_letter_status === "draft" ? (
    <li>
      <button
        className="dropdown-item"
        onClick={() => handleSendLetter(Promotion)}
      >
        Send Promotion Application
      </button>
    </li>
  ) : (
<li>
  <a 
    href={`${globalVariables.img_url}/uploads/staff_promotion_application_letter/${Promotion.promotion_request_letter}`} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="dropdown-item text-dark"
  >
    Promotion Application
  </a>
</li>

  )
}
                    
              

                {Promotion.Promotion_status === "Approved" && (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedPromotion(Promotion); // Update state first
                        }}
                      >
                        Generate Promotion Letter
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </td>
        </tr>
      );
    })
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

export default StaffPromotionRequests;