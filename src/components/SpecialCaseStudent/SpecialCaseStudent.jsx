import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Typography,
  Input,
  Button,
  Card,
  Select,
  Option,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slidebar from "../Slidebar/Slidebar";

const SpecialStudent = () => {
  const [formData, setFormData] = useState({
    courses: [],
    studentName: "",
    studentId: "",
  });
  const [coursesList, setCoursesList] = useState([]);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "https://timetableapi.runasp.net/api/Courses",
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCoursesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [organizedData, setOrganizedData] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const normalizeTime = (time) => {
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
  };

  const timeToMinutes = (time) => {
    const [start] = time.split("-");
    const [hours, minutes] = start.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const organizeData = (data) => {
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
      });

      allTimeSlots.add(time);
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort(
      (a, b) => timeToMinutes(a) - timeToMinutes(b)
    );

    setTimeSlots(sortedTimeSlots);
    return timetableData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        "https://timetableapi.runasp.net/api/Schedule/GenerateUniqueStudent",
        {
          ...formData,
          courseNames: formData.courses.map((c) => c.name), // تحويل المصفوفة إلى أسماء
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
      toast.success("تم إنشاء الجدول بنجاح!");
    } catch (error) {
      toast.error("فشل في إنشاء الجدول");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!organizedData) return null;

    return (
      <div className="max-w-screen-xl mx-auto rounded-md sm:px-6">
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
                              ? "bg-lecture"
                              : "bg-sections"
                          }`}
                        >
                          <div className="flex text-white justify-between">
                            <span className="font-bold text-white">
                              {lecture.course}
                            </span>
                            <span className="text-sm text-white">
                              {lecture.type === "lecture"
                                ? "Lecture"
                                : "Section"}
                            </span>
                          </div>
                          <div className="text-sm text-white">
                            <div>{lecture.professor}</div>
                            <div>{lecture.room || "غير محدد"}</div>
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
  };

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="max-w-screen-xl mx-auto rounded-md sm:px-6 p-4">
        <Typography variant="h2" className="text-center mb-6">
          Students outside the standard credit hour range
        </Typography>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
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

            {/* استبدال حقل الإدخال النصي بالكود الجديد */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-full p-2 border rounded-lg bg-white cursor-pointer"
                onClick={() => setShowCoursesDropdown(!showCoursesDropdown)}
              >
                <span className="text-gray-400">
                  {formData.courses.length > 0
                    ? formData.courses.map((c) => c.name).join(", ")
                    : "Select Courses"}
                </span>
              </div>

              {showCoursesDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {coursesList.map((course) => (
                    <div
                      key={course.id}
                      className={`p-3 hover:bg-blue-50 cursor-pointer ${
                        formData.courses.some((c) => c.id === course.id)
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={() => {
                        const exists = formData.courses.some(
                          (c) => c.id === course.id
                        );
                        setFormData((prev) => ({
                          ...prev,
                          courses: exists
                            ? prev.courses.filter((c) => c.id !== course.id)
                            : [...prev.courses, course],
                        }));
                      }}
                    >
                      <span className="text-gray-800">{course.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full active" disabled={loading}>
              {loading ? "Generating Timetable..." : "Generate Timetable"}
            </Button>
          </div>
        </form>

        {renderTable()}
      </div>
    </div>
  );
};

export default SpecialStudent;
