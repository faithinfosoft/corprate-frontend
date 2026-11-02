import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { convertDateFormat } from '../utilities/dateconverter';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import useAuth from '../utilities/useAuth';

const ViewEvaluationNotifications = () => {
    const [breadcum, setBreadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'School Evaluation Notifications', Link: '' },
    ]);

    const auth = useAuth();
    const school_id = auth.user.user_id;

    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [recordExistsMap, setRecordExistsMap] = useState({}); // Track existence for each notification
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const checkAllRecords = async () => {
            const recordStatuses = {};
            for (const application of applications) {
                if (application.fk_academic_year_id) {
                    const exists = await checkRecordExists(application.fk_academic_year_id, school_id);
                    recordStatuses[application.fk_academic_year_id] = exists;
                }
            }
            setRecordExistsMap(recordStatuses);
        };

        if (applications.length > 0) {
            checkAllRecords();
        }
    }, [applications, school_id]);

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
                setRecordExistsMap(prevState => ({
                    ...prevState,
                    [academic_year_Id]: true
                }));
                navigate(`/school-evaluation-form/${academic_year_Id}`);
            } else {
                print_toast("error", response.data.message || "Failed to insert record");
            }
        } catch (error) {
            print_toast("error", "An error occurred while inserting the record");
        }
    };

    const checkRecordExists = async (academicYear, schoolId) => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/schoolevaluationdocument/check-record-exists`, {
                params: { academic_year: academicYear, school_id: schoolId },
            });
            return response.data;
        } catch (error) {
            console.error("Error checking record existence:", error);
            return false;
        }
    };

    const filteredApplications = applications.filter(application =>
        application.notification_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(application.start_date).toLocaleDateString().includes(searchTerm)
    );

    const columns = [
        {
            name: <strong>Sl No.</strong>,
            selector: (row, index) => index + 1,
            sortable: true,
            minWidth: '80px'
        },
        {
            name: <strong>Title</strong>,
            selector: row => row.notification_title,
            sortable: true,
            minWidth: '280px'
        },
        {
            name: <strong>Description</strong>,
            selector: row => row.notification_desc,
            sortable: true,
            minWidth: '250px'
        },
        {
            name: <strong>Start Date</strong>,
            selector: row => row.start_date,
            sortable: true,
            minWidth: '100px',
            format: row => convertDateFormat(row.start_date),
        },
        {
            name: <strong>End Date</strong>,
            selector: row => row.end_date,
            sortable: true,
            minWidth: '100px',
            format: row => convertDateFormat(row.end_date)
        },
        {
            name: <strong>Action</strong>,
            minWidth: '100px',
            cell: row => {
                const recordExists = recordExistsMap[row.fk_academic_year_id] || false;

                return (
                    <div className="m-2">
                      {!recordExists.exists && (
    <button
        className="label label-warning pt-1 mb-2 btn-sm"
        onClick={() => handleCreateNow(row.fk_academic_year_id)}
        disabled={recordExists.exists} // Disable if record exists
    >
        <strong>Create Now</strong>
    </button>
)}
                      {recordExists.exists && recordExists.evaluation_doc_id && (
  <button
    className="btn btn-success btn-sm pt-1 mb-2"
    onClick={() => navigate(`/school-evaluation-form/${recordExists.evaluation_doc_id}`)}
  >
    <strong>Report</strong>
  </button>
)}
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <Breadcum items={breadcum} title="School Evaluation Notifications" />
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title">School Evaluation Notifications</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-end mb-3">
                        <input
                            type="text"
                            className="custom-data-table"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        className="custom-data-table"
                        data={filteredApplications}
                        pagination
                        responsive
                    />
                </div>
            </div>
        </>
    );
};

export default ViewEvaluationNotifications;
