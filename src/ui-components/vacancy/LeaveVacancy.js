import React, { useState } from "react";
import { convertDateFormat } from '../../utilities/dateconverter';
import VacancyModal from "./VacancyModal";
import print_toast from "../../utilities/Toaster.js";

const LeaveVacancy = ({ staff, handleSearch }) => {
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [showModal, setShowModal] = useState(false);
     const [vacancyNature, setVacancyNature] = useState("leave"); 
    const handleCheckboxChange = (person) => {
        if (selectedStaff.some(staff => staff === person)) {
            setSelectedStaff(selectedStaff.filter(staff => staff !== person));
        } else {
            setSelectedStaff([...selectedStaff, person]);
            setVacancyNature("leave");
        }
    };
    
    const handleCreateVacancy = () => {
        setShowModal(true);
    };
    
    return (
        <div className="table-responsive">
            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-success"
                    disabled={selectedStaff.length === 0}
                    onClick={handleCreateVacancy}
                >
                    Create Vacancy
                </button>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Sl No.</th>
                        <th>Select</th>
                        <th>School</th>
                        <th>Staff Name</th>
                        <th>Gender</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Designation</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((person, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                            <input
                                    type="checkbox"
                                    checked={selectedStaff.includes(person)}
                                    onChange={() => handleCheckboxChange(person)}
                                    className="form-check-input"
                                />
                            </td>
                            <td>{person.school_location}</td>
                            <td>{person.staff_official_name}</td>
                            <td>{person.gender}</td>
                            <td>{convertDateFormat(person.leave_start_date)}</td>
                            <td>{convertDateFormat(person.leave_end_date)}</td>
                            <td>{person.latest_service_record?.designation_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <VacancyModal
                selectedStaff={selectedStaff}
                vacancy_nature="leave"
                onClose={() => setShowModal(false)}
                show={showModal}
                print_toast={print_toast}
                handleSearch={handleSearch}
            />
        </div>
    );
};

export default LeaveVacancy;