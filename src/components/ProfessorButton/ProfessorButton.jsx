import { useState } from "react";

const ProfessorButton = ({ course }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const hasProfessors = course.professors?.length > 0;
  const buttonColor = hasProfessors ? 'bg-green-600' : 'bg-red-600';
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-3 py-1 rounded-md text-white ${buttonColor} hover:opacity-80`}
      >
        {hasProfessors ? 'متاح' : 'غير متاح'}
      </button>
      
      {showDetails && (
        <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg p-2 border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-1">طاقم التدريس:</h4>
          
          {hasProfessors ? (
            <>
              <p className="text-gray-700 font-semibold">الدكاترة:</p>
              <ul className="list-disc pl-5 mb-2">
                {course.professors.map(prof => (
                  <li key={prof.id} className="text-gray-700">{prof.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-700">لا يوجد دكاترة</p>
          )}
          
          {course.teachingAssistants?.length > 0 && (
            <>
              <p className="text-gray-700 font-semibold">المعيدين:</p>
              <ul className="list-disc pl-5">
                {course.teachingAssistants.map(ta => (
                  <li key={ta.id} className="text-gray-700">{ta.name}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessorButton;