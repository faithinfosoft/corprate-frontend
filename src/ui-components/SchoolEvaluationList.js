import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";
import { useNavigate } from 'react-router-dom';  
import Breadcum from './Breadcum';

const SchoolEvaluationList = () => {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();  
    const [breadcum, setBreadcum] = useState([
      { Title: 'Home', Link: '/' },
      { Title: 'School Evaluation List', Link: '' },
    ]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/schoolevaluation/getAll_evaluation_doc`);
      if (response.data.status) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const documentBaseUrl = `${globalVariables.api_url}/schoolevaluation/download_document`;

 
  const redirectToAddScore = () => {
    navigate('/schoolevaluation/add_score');  
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumbs */}
      {/* <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="#">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">School Evaluation List</li>
        </ol>
      </nav> */}

   


      {/* School Evaluation Documents Table */}
      <div className="row">
      <Breadcum items={breadcum} title="School Evaluation Documents List" />
        <div className="col-lg-12">


          <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">School Evaluation Documents List</h5>
        {documents.length > 0 ? (
  <div className="mb-1">
    <button onClick={redirectToAddScore} className="btn btn-danger">Add Score</button>
  </div>
) : null}
      </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Sl No</th>
                      <th scope="col">Acdemic Year</th>
                      <th scope="col">School Code</th>
                      <th scope="col">School Name</th>
                      <th scope="col">Score</th>
                      <th scope="col">Evaluation Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No Evaluation Documents Found</td>
                      </tr>
                    ) : (
                      documents.map((doc, index) => (
                        <tr key={doc.evaluation_doc_id}>
                          <td>{index + 1}</td>
                          <td>{doc.year_label}</td>
                          <td>{doc.school_code}</td>
                          <td>{doc.location}  {doc.school_name}</td>
                          <td>{doc.score}</td>
                          <td>
  <a
    href={`${documentBaseUrl}?school_id=${doc.fk_school_id}`} 
    target="_blank" 
    rel="noopener noreferrer"
    className="d-flex align-items-center gap-1 px-2 py-1"
    style={{ color: '#007bff' }} // Change the text color here
  >
    <i className="bi bi-file-pdf fs-6" style={{ color: '#007bff' }}></i> {/* Same color for the icon */}
    Download
  </a>
</td>



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
    </div>
  );
};

export default SchoolEvaluationList;
