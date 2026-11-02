import React, { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import globalVariables from "../Global.js";

// Draggable Row Component
const DraggableRow = ({ 
  candidate, 
  index, 
  moveRow 
}) => {
  const [, ref] = useDrag({
    type: 'CANDIDATE_ROW',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'CANDIDATE_ROW',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <tr 
      ref={(node) => ref(drop(node))}
      style={{ 
        backgroundColor: "#f9f9f9", 
        cursor: "move" 
      }}
    >
      <td>{candidate.rank}</td>
      <td>{candidate.candidate_name}</td>
      <td>{candidate.dob}</td>
      <td>{candidate.total_mark}</td>
      <td>{candidate.member_type}</td>
    </tr>
  );
};

// Main Component
const RankedCandidates = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    axios
      .get(`${globalVariables.api_url}/candidatemarklist/get-ranked-candidates`)
      .then((response) => {
        // Ensure candidates are sorted correctly on initial load
        const sortedCandidates = response.data.map((candidate, index) => ({
          ...candidate,
          rank: index + 1,
        }));
        setCandidates(sortedCandidates);
      })
      .catch((error) => {
        console.error("Error fetching ranked candidates:", error);
      });
  }, []);

  // Move row function
  const moveRow = (fromIndex, toIndex) => {
    const updatedCandidates = [...candidates];
    const [removed] = updatedCandidates.splice(fromIndex, 1);
    updatedCandidates.splice(toIndex, 0, removed);

    // Recalculate ranks
    const rankedCandidates = updatedCandidates.map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
    }));

    setCandidates(rankedCandidates);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Ranked Candidates</h2>
        <table border="1" className="table table-bordered">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Total Mark</th>
              <th>Member Type</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <DraggableRow
                key={candidate.id || candidate.rank}
                index={index}
                candidate={candidate}
                moveRow={moveRow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default RankedCandidates;