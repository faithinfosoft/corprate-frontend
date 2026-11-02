import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Breadcum from '../Breadcum.js';
import { json, useNavigate } from 'react-router-dom';
import useAuth from '../../utilities/useAuth';
import folder_image from '../../assets/ui-master/img/certificate_folder.png';

// Add CSS for hover effect
const styles = `
.folder-image {
  transition: transform 0.5s ease;
}

.folder-image:hover {
  -webkit-transform: scale(1.2);
  -ms-transform: scale(1.2);
  transform: scale(1.2);
  transition: 0.5s ease;
}
`;

const SchoolEvaluationReport = () => {
    const [breadcum, setBreadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'School Evaluation Report', Link: '' },
    ]);

    const auth = useAuth();
    const school_id = auth.user.user_id;

    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);



    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/transfer_notification/view_evaluation_notifications`);
            if (response.data.status) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching Applications:', error);
            print_toast("error", "Failed to fetch applications");
        }
    };

    const handleCreateNow = async (academic_year_Id) => {
        try {

            const response = await axios.post(
                `${globalVariables.api_url}/schoolevaluationdocument/save_evaluation`,
                {
                    academic_year_Id: academic_year_Id,
                    school_id: school_id,
                }
            );

            if (response.data.status) {
                const evaluation_doc_id = response.data.evaluation_doc_id;
                const evaluation_status = response.data.evaluation_status;
                const doc_file = response.data.doc_file;
            
                sessionStorage.setItem("evaluation_doc_id", evaluation_doc_id);
                // sessionStorage.setItem("evaluation_status", evaluation_status);
                // sessionStorage.setItem("doc_file", doc_file);
            
                if (evaluation_status === "draft" || evaluation_status === "preview") {
                    navigate("/school-evaluation-form");
                } else if (evaluation_status === "sent") {
                    // Open the file link in a new tab
                    window.open(`${globalVariables.img_url}/uploads/school_evaluation_reports/${doc_file}`, "_blank", "noopener,noreferrer");
                }
            } else {
                print_toast("error", response.data.message || "Failed to insert record");
            }
        } catch (error) {
            print_toast("error", "An error occurred while inserting the record");
        }
    };





    // Function to get folder image color based on academicyearstatus
    const getFolderStyle = (academicyearstatus) => {
        const baseStyle = {
            width: '100px',
            height: '100px',
            cursor: 'pointer',
        };

        if (academicyearstatus === "enabled") {
            return {
                ...baseStyle,
                filter: 'hue-rotate(40deg) ' // Green tint
            };
        } else if (academicyearstatus === "disabled") {
            return {
                ...baseStyle,
                filter: 'hue-rotate(-60deg) ' // Red tint
            };
        } else {
            return baseStyle;
        }
    };


    return (
        <>
            {/* Add the CSS style */}
            <style>{styles}</style>

            <Breadcum items={breadcum} title="School Evaluation Report" />

            {/* Folder Display Section */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title">School Evaluation Report</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        {applications.map((application, index) => (
                            <div key={application.tr_notification_id} className="col-md-4 mb-4 text-center">
                                <div className="folder-item">
                                   
                                    <img
                                        src={folder_image}
                                        alt={`Folder for ${application.year_label}`}
                                        className="folder-image" // Added class for hover effect
                                        style={getFolderStyle(application.academicyearstatus)}
                                        onClick={() => {

                                            handleCreateNow(application.fk_academic_year_id);
                                        }}
                                    />
                                    <div className="mt-2">
                                        <strong>{application.year_label}</strong>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchoolEvaluationReport;