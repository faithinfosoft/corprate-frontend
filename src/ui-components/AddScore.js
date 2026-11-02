import React, { useEffect, useState } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js"; 
import print_toast from "../utilities/Toaster.js";
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Breadcum from './Breadcum';

const AddScore = () => {
  const [schools, setSchools] = useState([]);
  const [scores, setScores] = useState({}); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigation

  const [breadcum, setBreadcum] = useState([
    { Title: <Link to="/evaluationlist">School Evaluation List</Link> },
    { Title: 'School Evaluation Score Details', Link: '' },
  ]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${globalVariables.api_url}/schoolevaluation/getAll_evaluation_doc`);
        if (response.data && Array.isArray(response.data.data)) {
          setSchools(response.data.data);
        
          const initialScores = response.data.data.reduce((acc, school) => {
            acc[school.school_id] = school.score || ''; // Set initial score
            return acc;
          }, {});
          setScores(initialScores);
        } else {
          console.error("The fetched data is not in the expected format", response.data);
        }
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };

    fetchSchools();
  }, []);

  // Handle score change for each school
  const handleScoreChange = (schoolId, value) => {
    setScores((prevScores) => ({
      ...prevScores,
      [schoolId]: value,
    }));
  };

  // Save scores
  const handleSaveScores = async () => {
    setLoading(true);  // Show loading state
    try {
      const updatedScores = Object.entries(scores).map(([schoolId, score]) => ({
        school_id: Number(schoolId),
        score: Number(score),
      }));
  
      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/updateScore`,
        { scores: updatedScores },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      print_toast('success', 'Scores saved successfully!');  

      // Redirect to School Evaluation List after success
      setTimeout(() => {
        navigate('/evaluation-list');
      }, 1500); // Delay for better user experience
      
    } catch (error) {
      console.error('Error saving scores:', error.response ? error.response.data : error);
      print_toast('error', 'Error saving scores!');  
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="container mt-4">
      <Breadcum items={breadcum} title="School Evaluation Score Details" />
      
      {/* Add Score Table */}
      <div className="row">
        <div className="col-lg-12 mx-auto">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Evaluation Score Details</h5>
            </div>
            <div className="card-body">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>School Code</th>
                    <th>School Name</th>
                    
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school, index) => (
                    <tr key={school.school_id}>
                      <td>{index + 1}</td>
                      <td>{school.school_code}</td>
                      <td>{school.school_name}, {school.location}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={scores[school.school_id] || ''}
                          onChange={(e) => handleScoreChange(school.school_id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-primary" onClick={handleSaveScores} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddScore;
