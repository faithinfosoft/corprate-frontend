import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import globalVariables from '../../Global.js';

import useAuth from '../../utilities/useAuth.js';
const ZoneList = ({ onSelect, showAllOption }) => {
    const auth = useAuth();
    const [zoneValues, setzoneValues] = useState([]);
    const [error, setError] = useState(null);
    const userType = auth.user.user_type;
   

    useEffect(() => {
        const fetchZoneValues = async () => {
            try {
                const response = await axios.get(globalVariables.api_url + '/school/get_zones', {
                    params: {
                        userType: userType,
                        
                    }
                });

                if (response.data.status === true) {
                    if (Array.isArray(response.data.data)) {
                        setzoneValues(response.data.data);
                    } else {
                        console.error('API response data is not an array:', response.data.data);
                        setError('Invalid data format');
                    }
                } else {
                    console.error('API response status is not true:', response.data.message);
                    setError('Failed to fetch forane values');
                }
            } catch (error) {
                console.error('Error fetching dropdown values:', error);
                setError('Failed to fetch forane values');
            }
        };

        fetchZoneValues();
    }, [userType]);


    const handleZoneChange = (event) => {
        const selectedValue = event.target.value;
       
        onSelect(selectedValue); // Pass the selected Forane value to the parent component
    };

    return (
        <>
        
           
               
                <select id="zoneid" name="zoneid" className="form-select" onChange={handleZoneChange} required>
                    <option value="">Select Zone</option>
                    <option value="All">All</option>
                    {Array.isArray(zoneValues) && zoneValues.map(item => (
                        <option key={item.zone_id} value={item.zone_id}>
                            {item.zone_name}
                        </option>
                    ))}
                </select>











           
       
       
    </>
    
    );
};

ZoneList.propTypes = {
    onSelect: PropTypes.func.isRequired,
    showAllOption: PropTypes.bool
};

ZoneList.defaultProps = {
    showAllOption: false
};

export default ZoneList;
