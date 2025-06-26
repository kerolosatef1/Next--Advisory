import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Typography,
  Input,
  Button,
  Card,
  
} from "@material-tailwind/react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";

const SpecialStudent = () => {
  const [formData, setFormData] = useState({
    courses: [],
    studentName: "",
    studentId: "",
  });
  const [coursesList, setCoursesList] = useState([]);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [organizedData, setOrganizedData] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
 
  
  const dropdownRef = useRef(null);
  const tableRef = useRef(null);

  const daysOfWeek = [
    { id: "1", name: "Saturday" },
    { id: "2", name: "Sunday" },
    { id: "3", name: "Monday" },
    { id: "4", name: "Tuesday" },
    { id: "5", name: "Wednesday" },
    { id: "6", name: "Thursday" },
    { id: "7", name: "Friday" },
  ];

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "https://timetableapi.runasp.net/api/Schedule/AllCourseInTimeTable",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCoursesList(response.data);
      } catch (error) {
        toast.error("Failed to fetch courses");
      }
    };
    fetchCourses();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCoursesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper functions
  const normalizeTime = useCallback((time) => {
    if (!time) return "00:00-00:00";
    const cleanedTime = time.replace(/\s+/g, "").replace(/[^0-9:-]/g, "");
    const times = cleanedTime.split("-");

    if (times.length !== 2) return "00:00-00:00";

    const toMinutes = (t) => {
      let [h, m] = t.split(":").map((num) => parseInt(num, 10) || 0);
      if (h >= 1 && h <= 5) h += 12;
      return h * 60 + (m || 0);
    };

    const startMinutes = toMinutes(times[0]);
    let endMinutes = toMinutes(times[1]);

    const format = (minutes) => {
      const h = Math.floor(minutes / 60) % 24;
      const m = minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    return `${format(startMinutes)}-${format(endMinutes)}`;
  }, []);

  const timeToMinutes = useCallback((time) => {
    const [start] = time.split("-");
    const [hours, minutes] = start.split(":").map(Number);
    return hours * 60 + minutes;
  }, []);

  const organizeData = useCallback((data) => {
    const timetableData = {};
    const allTimeSlots = new Set();

    data.forEach((entry) => {
      const day = entry.day;
      const time = normalizeTime(entry.time_slot);

      if (!timetableData[day]) timetableData[day] = {};
      if (!timetableData[day][time]) timetableData[day][time] = [];

      timetableData[day][time].push({
        course: entry.name_course,
        professor: entry.name_professor_or_teaching_assistant,
        room: entry.room,
        type: entry.type,
        year: entry.year,
        group: entry.group
      });

      allTimeSlots.add(time);
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort(
      (a, b) => timeToMinutes(a) - timeToMinutes(b)
    );

    setTimeSlots(sortedTimeSlots);
    return timetableData;
  }, [normalizeTime, timeToMinutes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        "https://timetableapi.runasp.net/api/Schedule/GenerateUniqueStudent",
        {
          ...formData,
          courseNames: formData.courses, // الآن courses تحتوي على الأسماء مباشرة
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const organized = organizeData(response.data);
      setOrganizedData(organized);
      toast.success("Timetable generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = useCallback((courseName) => {
    const exists = formData.courses.includes(courseName);
    setFormData(prev => ({
      ...prev,
      courses: exists
        ? prev.courses.filter(c => c !== courseName)
        : [...prev.courses, courseName]
    }));
  }, [formData.courses]);

  const renderTable = useMemo(() => {
    if (!organizedData || Object.keys(organizedData).length === 0) return null;

    return (
      <div className="max-w-screen-xl mx-auto rounded-md sm:px-6 mt-8">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-700">
              <tr>
                <th className="p-3 text-white font-bold border border-blue-600">
                  Day/Time
                </th>
                {timeSlots.map((time) => {
                  const [start, end] = time.split("-");
                  return (
                    <th
                      key={time}
                      className="p-3 text-white font-bold border border-blue-600"
                    >
                      {start} - {end}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {daysOfWeek.map((day) => (
                <tr key={day.id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-white text-center bg-slate-600 border border-gray-300">
                    {day.name}
                  </td>
                  {timeSlots.map((time) => (
                    <td key={time} className="p-3 border border-gray-300">
                      {organizedData[day.id]?.[time]?.map((lecture, idx) => (
                        <div
                          key={idx}
                          className={`mb-2 p-2 rounded ${
                            lecture.type === "lecture"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          <div className="flex text-white justify-between">
                            <span className="font-bold">{lecture.course}</span>
                            <span className="text-sm">
                              {lecture.type === "lecture" ? "Lecture" : "Section"}
                            </span>
                          </div>
                          <div className="text-sm text-white">
                            <div>{lecture.professor}</div>
                            <div>{lecture.room || "Not specified"}</div>
                            <div>Year: {lecture.year}</div>
                            <div>Group: {lecture.group}</div>
                          </div>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [organizedData, timeSlots]);

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="max-w-screen-xl mx-auto rounded-md sm:px-6 p-4">
        <Typography variant="h2" className="text-center mb-6 text-white">
          Students outside the standard credit hour range
        </Typography>

        <Card className="p-6 mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <Input
                label="Student Name"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                required
              />

              <Input
                type="number"
                label="Student ID"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                required
              />

              <div className="relative" ref={dropdownRef}>
                <div
                  className="w-full p-2 border rounded-lg bg-white cursor-pointer"
                  onClick={() => setShowCoursesDropdown(!showCoursesDropdown)}
                >
                  <span className={formData.courses.length > 0 ? "text-gray-800" : "text-gray-500"}>
                    {formData.courses.length > 0
                      ? formData.courses.join(", ")
                      : "Select Courses"}
                  </span>
                </div>

                {showCoursesDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {coursesList.map((courseName, index) => (
                      <div
                        key={index}
                        className={`p-3 cursor-pointer hover:bg-blue-50 ${
                          formData.courses.includes(courseName)
                            ? "bg-blue-100"
                            : ""
                        }`}
                        onClick={() => handleCourseSelect(courseName)}
                      >
                        <span className="text-gray-800">{courseName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full active" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingAnimation size="small" />
                    <span>Generating Timetable...</span>
                  </div>
                ) : (
                  "Generate Timetable"
                )}
              </Button>
            </div>
          </form>
        </Card>

        {renderTable}

        
      </div>
    </div>
  );
};

export default SpecialStudent;