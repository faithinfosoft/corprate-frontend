
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, Outlet, Link } from "react-router-dom";
import Breadcum from "../Breadcum";
import { useLocation } from "react-router-dom";
import axios from 'axios';
import globalVariables from "../../Global.js";

const DataContext = createContext();

export const useData = () => useContext(DataContext);
const SchoolEvaluationForm = () => {

  //const location = useLocation();
    const evaluation_doc_id =  sessionStorage.getItem("evaluation_doc_id");
   // const evaluation_status = sessionStorage.getItem("evaluation_status");
    // const doc_file = sessionStorage.getItem("doc_file");
//console.log(evaluation_status);
  
     

  const [breadcum, setBreadcum] = useState([
       { Title: "Home", Link: "/" },
        { Title: "School Evaluation Report", Link: "/school-evaluation-report" },
      ]);
  //const { id } = useParams();
  const [evaluationDocumentDetails, setEvaluationDocumentDetails] = useState({});


  
  const fetchEvaluationDocDetails = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/schoolevaluationdocument/get_evaluation_doc_id/${evaluation_doc_id}`);

      if (response.data.status) {
        setEvaluationDocumentDetails(response.data.data);
      } 
    } catch (error) {
      console.error('Error fetching classes:', error.message);
    }

  };
  useEffect(() => {
    fetchEvaluationDocDetails();
  }, [evaluation_doc_id]);




  if (!evaluationDocumentDetails) return <p>Loading data...</p>;
  if (!evaluationDocumentDetails) return <p>Loading data...{JSON.stringify(evaluationDocumentDetails)}</p>;

  return (


 

    <DataContext.Provider value={{ evaluationDocumentDetails, setEvaluationDocumentDetails }}>
    
    <div>
    <Breadcum items={breadcum} title={`School Evaluation Form ${evaluationDocumentDetails?.year_label}`} />

    <nav className="navbar navbar-expand-lg bg-info">
      <div className="container">
        <ul className="navbar-nav d-flex flex-row gap-3 text-white">
        <li className="nav-item ">
            <Link className="nav-link text-white " to="/school-evaluation-form/school-evaluation-dashboard">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white " to="/school-evaluation-form/physical-facilities">Physical Facilities</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/school-activity">Activity</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white " to="/school-evaluation-form/school-magazines">Magazines</Link>
          </li>
           <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/examination-results">Examination Results</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/overall-championship">OverallChampionship</Link>
          </li> 
           <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/achievements">Achievements</Link>
          </li> 
          <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/staff-achievement">Achievements of Staff</Link>
          </li> 
          <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/school-innovations">School Innovations</Link>
          </li> 
          
          <li className="nav-item">
            <Link className="nav-link text-white" to="/school-evaluation-form/school-evaluation-preview">Preview</Link>
          </li>
        </ul>
      </div>
    </nav>
      <Outlet /> {/* Renders the current nested route */}
    </div>
  </DataContext.Provider>
  );
};

export default SchoolEvaluationForm;
