import React, { useEffect, useState } from "react";
import axios from "axios";
import globalVariables from "../Global.js";

const EditModule = ({ categoryId, categoryDetailsId, onClose }) => {
  const [localCategoryDetailsId, setLocalCategoryDetailsId] = useState(null);
  const [responses, setResponses] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

      
        const response = await axios.get(
           `${globalVariables.api_url}/schoolinfrastructure/getDataByCategory/${categoryId}`
        );

        const backendData = response.data?.data || [];
        console.log("Backend data fetched:", backendData);

        if (backendData.length > 0) {
          const fetchedCategoryDetailsId = backendData[0].category_details_id;
          setLocalCategoryDetailsId(fetchedCategoryDetailsId);

          const commonRemarks = backendData[0].construction_remarks || "";
          setGeneralInstructions(commonRemarks);

          const initialMeasurements = backendData.reduce((acc, item) => {
            acc[item.infrastructure_id] = item.measurement_values || "";
            return acc;
          }, {});

          setResponses(backendData);
          setMeasurements(initialMeasurements);
        }
      } catch (err) {
        console.error("Error details:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleRadioChange = (itemId, answer) => {
    setResponses((prevResponses) =>
      prevResponses.map((response) =>
        response.infrastructure_id === itemId
          ? { ...response, item_value: answer }
          : response
      )
    );

    if (answer === "no") {
      setMeasurements((prevMeasurements) => ({
        ...prevMeasurements,
        [itemId]: "",
      }));
    }
  };

  const handleMeasurementChange = (itemId, value) => {
    // Check if the value is a valid positive number
    if (value >= 0 || value === "") {
      setMeasurements((prevMeasurements) => ({
        ...prevMeasurements,
        [itemId]: value,
      }));
    }
  };
  
  const handleGeneralInstructionsChange = (e) => {
    setGeneralInstructions(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const dataToSubmit = {
      fk_category_id: categoryId,
      category_details_id: localCategoryDetailsId,
      responses: responses.map((response) => ({
        infrastructure_id: response.infrastructure_id,
        item_value: response.item_value,
        item_capacity: response.item_capacity,
        measurement_values: measurements[response.infrastructure_id] || "",
      })),
      generalInstructions,
    };

    console.log("Data being sent:", dataToSubmit);

    try {

      const result = await axios.post(
        `${globalVariables.api_url}/schoolinfrastructure/updateData`,
        dataToSubmit
      );

      if (result.data?.status) {
        alert("Data saved successfully!");
        // Close the modal on success
        onClose();
      } else {
        alert(result.data?.message || "Failed to save data.");
      }
    } catch (error) {
      console.error("Error during saving data:", error);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setResponses([]);
    setGeneralInstructions("");
    setMeasurements({});
    onClose(); // Close the modal if cancel is clicked
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="hidden"
            name="category_details_id"
            value={localCategoryDetailsId}
          />

          {responses.map((item) => (
            <div key={item.infrastructure_id} className="form-group">
              <div className="row">
                <label className="col-12">
                  {item.item_name} <span style={{ color: "red" }}>*</span>
                </label>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`item-${item.infrastructure_id}`}
                      value="yes"
                      checked={item.item_value === "yes"}
                      onChange={() =>
                        handleRadioChange(item.infrastructure_id, "yes")
                      }
                      required
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`item-${item.infrastructure_id}`}
                      value="no"
                      checked={item.item_value === "no"}
                      onChange={() =>
                        handleRadioChange(item.infrastructure_id, "no")
                      }
                      required
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </div>

              {item.item_value === "yes" && (
                <div className="row mt-3">
                  <div className="col-12">
                    <label>
                      Enter value in {item.item_capacity}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <input type="number"
                      className="form-control"
                      placeholder={`Enter value in ${item.item_capacity}`}
                      value={measurements[item.infrastructure_id] || ""}
                      onChange={(e) =>
                      handleMeasurementChange(item.infrastructure_id, e.target.value)
                    }
                    required
                    min="0" // Prevents entering negative numbers from UI
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="row mt-4">
            <div className="col-12">
              <label>
                Mention the constructions during this year{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows="3"
                value={generalInstructions}
                onChange={handleGeneralInstructionsChange}
                placeholder="Mention the constructions during this year"
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-start mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-success"
              style={{ marginRight: "8px" }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditModule;
