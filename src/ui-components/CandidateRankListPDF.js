import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../Global.js";
import DataTable from "react-data-table-component";
import Breadcum from './Breadcum';
import { capitalizeWords } from '../utilities/dateconverter';
const CandidateRankListPDF = () => {
  const { fk_exam_application_subject_id } = useParams();

  // Breadcum data
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '/exam-application' },
    { Title: 'Candidate Exam Rank List', Link: '' },
  ]);


  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  
  // Fetch rank list on component mount
  useEffect(() => {
    fetchRankList();
  }, []);

  // Function to fetch rank list from the API
  const fetchRankList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidatemarklist/get_rank_list`,
        {
          params: { fk_exam_application_subject_id },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const rankList = response.data.data || []; // Adjust based on your API structure
      if (Array.isArray(rankList)) {
        setTableData(rankList);
        setShowTable(true);
      } else {
        console.error('Unexpected data format:', rankList);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {

      const form_data = {
        params: {
            fk_exam_application_subject_id: fk_exam_application_subject_id,
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/candidatemarklist/search_reports_candidate_rank_list', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidateexamranklist.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };


  // Define columns for the DataTable
  const columns = [
    { name: "Rank", selector: (row) => row.rank, sortable: true, width: '90px' },
    { name: "Marks", selector: (row) => row.total_mark, sortable: true, width: '100px' },
    { name: "Type", selector: (row) => capitalizeWords(row.candidate_type), sortable: true, width: '130px' },
    {
      name: "Candidate Name",
      selector: (row) => (
        <span className="fw-bold text-primary">
          {capitalizeWords(row.applicant_name)}
        </span>
      ),
      sortable: true,
      minWidth: '180px',
    },
    { 
      name: "Gender", 
      selector: (row) => {
        const type = (row.candidate_type || '').toLowerCase();
        if (type.includes('sister')) return 'Female';
        if (type.includes('priest')) return 'Male';
        return capitalizeWords(row.gender || '-');
      }, 
      sortable: true, 
      width: '100px' 
    },
    { name: "Email", selector: (row) => row.email || '-', sortable: true, minWidth: '200px' },
    { name: "Remarks", selector: (row) => row.remarks || 'None', sortable: true, minWidth: '150px' },
  ];

  return (
    <>
      <Breadcum items={breadcum} title="Candidate Exam Rank List" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Candidate Exam Rank List</h5>
            </div>

            <div className="card-body">
              {loading && <p>Loading...</p>}

              {tableData.length > 0 && (
                   <div className="exportpdf col-lg-12 m-2">
                   {tableData.length > 0 && (

                     <>
                      

                       <button onClick={handleGeneratePDF} className="btn btn-success btn-sm mt-10 float-end" disabled={pdfloading}>

                         {pdfloading ? (
                           <>
                             <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...
                           </>
                         ) : (
                           <>
                             <span className="bi bi-file-pdf" role="status" aria-hidden="true"></span> Export to PDF
                           </>
                         )}

                       </button>


                     </>
                   )}
                 </div>
              )}

              {showTable && Array.isArray(tableData) && (
                <div className="row mt-4">
                  <div className="col-md-12">
                    <DataTable
                      columns={columns}
                      data={tableData}
                      className="custom-data-table"
                      pagination
                      paginationComponentOptions={{
                        rowsPerPageText: "Rows per page:",
                        rangeSeparatorText: "of",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateRankListPDF;
