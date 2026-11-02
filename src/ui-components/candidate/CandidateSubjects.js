import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from '../NoDataFound';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import { useParams } from 'react-router-dom';

const CandidateSubjects = ({ candidateId, readOnly }) => {
    const { candidate_id: param_id } = useParams();
    const effective_candidate_id = candidateId || param_id;

    const [subjects, setSubjects] = useState([]);
    const [candidateSubjects, setCandidateSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [formError, setFormError] = useState('');

    // Fetch all available subjects
    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/exam_application/getSubjects`);
            if (response.data.status) {
                console.log("Fetched Subjects:", response.data.data);
                setSubjects(response.data.data || []);
            } else {
                console.log("Failed to fetch subjects:", response.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error.message);
        }
    };

    // Fetch candidate's subjects
    const fetchCandidateSubjects = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/candidatesubject/view_subject`, {
                params: { fk_candidate_id: effective_candidate_id },
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.data.status) {
                setCandidateSubjects(response.data.data || []);
            } else {
                setCandidateSubjects([]);
            }
            setLoaded(true);
        } catch (error) {
            console.error('Error fetching candidate subjects:', error.message);
            setCandidateSubjects([]);
            setLoaded(true);
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchCandidateSubjects();
    }, [effective_candidate_id]);

    // Add subject
    const handleAddSubject = async (e) => {
        e.preventDefault();

        if (!selectedSubjectId) {
            setFormError('Please select a subject');
            return;
        }

        setSaving(true);
        setFormError('');

        try {
            const params = new URLSearchParams();
            params.append('fk_candidate_id', effective_candidate_id);
            params.append('fk_subject_id', selectedSubjectId);

            const response = await axios.post(`${globalVariables.api_url}/candidatesubject/save_subject`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data.status) {
                await fetchCandidateSubjects();
                setSelectedSubjectId('');
                print_toast("success", response.data.message);
            } else {
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error adding subject:', error.message);
            print_toast("error", "Failed to add subject");
        } finally {
            setSaving(false);
        }
    };

    // Delete subject
    const handleDeleteSubject = async (candidateSubject) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('candidate_subject_id', candidateSubject.candidate_subject_id);

            const response = await axios.post(`${globalVariables.api_url}/candidatesubject/delete_subject`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data.status) {
                print_toast("success", response.data.message);
                await fetchCandidateSubjects();
            } else {
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error deleting subject:', error.message);
            print_toast("error", "Failed to delete subject");
        }
    };

    // Get already added subject IDs to filter dropdown
    const addedSubjectIds = candidateSubjects.map(sub => String(sub.fk_subject_id));

    // Filter available subjects (exclude already added)
    const availableSubjects = subjects.filter(
        subject => !addedSubjectIds.includes(String(subject.subject_id))
    );

    return (
        <div className="row">
            {/* Candidate's Subjects Table */}
            <div className={readOnly ? "col-lg-12" : "col-lg-8"}>
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">My Subjects</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th className="text-center">Sl No.</th>
                                        <th className="text-center">Subject</th>
                                        {!readOnly && <th className="text-center">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loaded && candidateSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan="3">
                                                <NoDataFound />
                                            </td>
                                        </tr>
                                    ) : (
                                        candidateSubjects.map((subject, index) => (
                                            <tr key={subject.candidate_subject_id}>
                                                 <td className="text-center">{index + 1}</td>
                                                 <td className="text-center">
                                                     {subject.subject_name}
                                                     {subject.class_level_name && !subject.subject_name.toUpperCase().includes(subject.class_level_name.toUpperCase())
                                                         ? ` (${subject.class_level_name})`
                                                         : ''}
                                                 </td>
                                                 {!readOnly && (
                                                     <td className="text-center">
                                                         <button
                                                             className="btn btn-sm btn-danger"
                                                             onClick={() => handleDeleteSubject(subject)}
                                                         >
                                                             <i className="bi bi-trash"></i> Delete
                                                         </button>
                                                     </td>
                                                 )}
                                             </tr>
                                         ))
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Add Subject Form */}
             {!readOnly && (
                 <div className="col-lg-4">
                     <div className="card">
                         <div className="card-header">
                             <h5 className="card-title">Add Subject</h5>
                         </div>
                         <div className="card-body">
                             <form onSubmit={handleAddSubject}>
                                 <div className="mb-3">
                                     <label htmlFor="subject" className="form-label">
                                         Select Subject <span className="text-danger">*</span>
                                     </label>
                                     <select
                                         className="form-select"
                                         id="subject"
                                         value={selectedSubjectId}
                                         onChange={(e) => {
                                             setSelectedSubjectId(e.target.value);
                                             setFormError('');
                                         }}
                                     >
                                         <option value="">-- Select a Subject --</option>

                                         <optgroup label="Higher Secondary (HSS)">
                                             {availableSubjects
                                                 .filter(subject => subject.class_level_name === 'HSS')
                                                 .map((subject) => (
                                                     <option key={subject.subject_id} value={subject.subject_id}>
                                                         {subject.subject_name.toUpperCase().includes('HSS') ? subject.subject_name : `${subject.subject_name} (HSS)`}
                                                     </option>
                                                 ))}
                                         </optgroup>

                                         <optgroup label="High School (HST / HS)">
                                             {availableSubjects
                                                 .filter(subject => subject.class_level_name === 'HS' || (subject.subject_name && subject.subject_name.toUpperCase().startsWith('HST')))
                                                 .map((subject) => (
                                                     <option key={subject.subject_id} value={subject.subject_id}>
                                                         {subject.subject_name}
                                                     </option>
                                                 ))}
                                         </optgroup>

                                         <optgroup label="Primary (LP / UP)">
                                             {availableSubjects
                                                 .filter(subject => (subject.class_level_name === 'LP' || subject.class_level_name === 'UP') && !(subject.subject_name && subject.subject_name.toUpperCase().startsWith('HST')))
                                                 .map((subject) => (
                                                     <option key={subject.subject_id} value={subject.subject_id}>
                                                         {subject.subject_name}
                                                     </option>
                                                 ))}
                                         </optgroup>

                                         <optgroup label="Specialist Subject">
                                             {availableSubjects
                                                 .filter(subject => subject.subject_type && subject.subject_type.trim() === 'Specialist Subject')
                                                 .map((subject) => (
                                                     <option key={subject.subject_id} value={subject.subject_id}>
                                                         {subject.subject_name}
                                                     </option>
                                                 ))}
                                         </optgroup>

                                         {availableSubjects.filter(subject =>
                                             subject.class_level_name !== 'HSS' &&
                                             subject.class_level_name !== 'HS' &&
                                             subject.class_level_name !== 'LP' &&
                                             subject.class_level_name !== 'UP' &&
                                             !(subject.subject_name && subject.subject_name.toUpperCase().startsWith('HST')) &&
                                             !(subject.subject_type && subject.subject_type.trim() === 'Specialist Subject')
                                         ).length > 0 && (
                                             <optgroup label="Other Subjects">
                                                 {availableSubjects
                                                     .filter(subject =>
                                                         subject.class_level_name !== 'HSS' &&
                                                         subject.class_level_name !== 'HS' &&
                                                         subject.class_level_name !== 'LP' &&
                                                         subject.class_level_name !== 'UP' &&
                                                         !(subject.subject_name && subject.subject_name.toUpperCase().startsWith('HST')) &&
                                                         !(subject.subject_type && subject.subject_type.trim() === 'Specialist Subject')
                                                     )
                                                     .map((subject) => (
                                                         <option key={subject.subject_id} value={subject.subject_id}>
                                                             {subject.subject_name}
                                                         </option>
                                                     ))}
                                             </optgroup>
                                         )}
                                     </select>
                                    {formError && <span className="text-danger">{formError}</span>}
                                </div>
                                <div className="text-end">
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={saving || !selectedSubjectId}
                                    >
                                        {saving ? 'Adding...' : 'Add Subject'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateSubjects;
