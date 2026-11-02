import React, { useState, useEffect } from 'react';


import axios from 'axios';
import DataTable from 'react-data-table-component';
import Multiselect from 'multiselect-react-dropdown';
import { convertDateFormat } from '../utilities/dateconverter';

import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { Link,useNavigate } from 'react-router-dom'; // Import useNavigate

const CandidateApplicationDetails = () => {
    const [breadcum, setBreadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'Candidate Application Details', Link: '' },
    ]);



    

    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [applicationid, setapplicationid] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // Use navigate hook

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/exam_application/getApplications`);
            if (response.data.status) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching Applications:', error);
            print_toast("error", "Failed to fetch applications");
        }
    };

    const handleCandidates = (application) => {
        if (application) {
            setapplicationid(application);

            navigate('/applied-candidates', { state: { application: application } });
            //console.log(application) 
        } else {
            console.error('candidates is null or undefined');

        }
    };
    const handleCertificate = (application) => {
        if (application) {
            setapplicationid(application);

            navigate('/certificate-verification-schedule', { state: { application: application } });
        } else {
            console.error('candidates is null or undefined');

        }
    };
    

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredApplications = applications.filter(application =>
        application.application_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(application.start_date).toLocaleDateString().includes(searchTerm)
    );

    const columns = [
        {
            name: <strong>Sl No.</strong>,
            selector: (row, index) => index + 1,
            sortable: true,
            minWidth: '20px'
        },
        { 
            name: <strong>Exam Title</strong>,
            selector: row => row.application_title,
            sortable: true,
            cell: row => (
              <a
                href="#"
             
                 className="custom-link"
               
              >
                {row.application_title}
              </a>
            )
          },,
        {
            name: <strong>Start Date</strong>,
            selector: row => row.start_date,
            sortable: true,
            format: row => convertDateFormat(row.start_date),
        },
        {
            name: <strong>End Date</strong>,
            selector: row => row.end_date,
            sortable: true,
            format: row => convertDateFormat(row.end_date)
        },
        {
            name: <strong></strong>,
            minWidth: '300px', // Set a minimum width
            width: '300px',
            cell: row => (
                <div className="m-2">
                  <Link to={`/applied-candidates/${row.application_id}`} className="label label-warning pt-1 mb-2"><strong>Applied Candidates</strong></Link>
         <br></br>
                    <a href="#" className="label label-danger" onClick={() => handleCertificate(row)}><strong>Certificate Verification Schedule</strong></a>
                </div>
            )
        }
    ];

    return (
        <>
            <Breadcum items={breadcum} title="Candidate Applications" />
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title">Candidate Application Details</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-end mb-3">
                        <input
                            type="text"
                            className="custom-data-table"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredApplications}
                        pagination
                        responsive
                    />
                </div>
            </div>
        </>
    );
};

export default CandidateApplicationDetails;
