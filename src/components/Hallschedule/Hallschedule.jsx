import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  Select,
  Option,
  Input,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../Loading/Loading";
import Slidebar from "../Slidebar/Slidebar";

const WeeklyClassroomTimetable = () => {
  const [organizedData, setOrganizedData] = useState({});
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  // دالة تنظيم البيانات من الAPI
  const organizeData = (data) => {
    const classrooms = {};
    const allTimeSlots = new Set();

    data.flat().forEach((entry) => {
      const classroom = entry.name_classRoom;
      const day = entry.day;
      const time = normalizeTime(entry.time_slot);

      if (!classrooms[classroom]) classrooms[classroom] = {};
      if (!classrooms[classroom][day]) classrooms[classroom][day] = {};

      if (!classrooms[classroom][day][time]) {
        classrooms[classroom][day][time] = [];
      }

      classrooms[classroom][day][time].push({
        course: entry.name_course,
        professor: entry.name_professor, // أضفنا اسم الأستاذ
        year: entry.year, // أضفنا السنة الدراسية
        group: entry.name_group, // أضفنا اسم الجروب
        time: entry.time_slot,
      });

      allTimeSlots.add(time);
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort(
      (a, b) => timeToMinutes(a) - timeToMinutes(b)
    );

    setTimeSlots(sortedTimeSlots);
    return classrooms;
  };

  // الدوال المساعدة لمعالجة الوقت
  const normalizeTime = (time) => {
    const [start, end] = time.split("-").map((t) =>
      t
        .trim()
        .padStart(5, "0")
        .replace(
          /(\d{2}):(\d{2})/,
          (_, h, m) =>
            `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        )
    );
    return `${start}-${end}`;
  };

  const timeToMinutes = (time) => {
    const [start] = time.split("-");
    const [hours, minutes] = start.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // جلب البيانات من الAPI
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "https://timetableapi.runasp.net/api/Schedule/ClassRooms",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const organized = organizeData(response.data);
        setOrganizedData(organized);

        const firstClassroom = Object.keys(organized)[0] || "";
        setSelectedClassroom(firstClassroom);
      } catch (error) {
        toast.error("Failed to load classroom data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // عرض الجدول
  const renderTable = () => {
    if (!organizedData[selectedClassroom]) return null;

    return (
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700">
            <tr>
              <th className="p-3 text-white font-bold border border-blue-600">
                Day/Time
              </th>
              {timeSlots.map((time) => (
                <th
                  key={time}
                  className="p-3 text-white font-bold border border-blue-600"
                >
                  {time.split("-").join(" - ")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {daysOfWeek.map((day) => (
              <tr key={day.id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold text-white bg-blue-300 border-gray-300">
                  {day.name}
                </td>
                {timeSlots.map((time) => (
                  <td key={time} className="p-3 border border-gray-300">
                    {organizedData[selectedClassroom][day.id]?.[time]?.map(
                      (lecture, idx) => (
                        <div key={idx} className="mb-2 p-2 rounded bg-green-300">
                          <div className="text-sm text-gray-800">
                            {lecture.course}
                          </div>

                          <div className="text-xs text-gray-600">
                            <span className="block">{lecture.professor}</span>
                            <span>
                              Year {lecture.year} - Group {lecture.group}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  // تصفية القاعات حسب البحث
  const filteredClassrooms = Object.keys(organizedData).filter((classroom) =>
    classroom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="max-w-screen-xl mx-auto rounded-md sm:px-6 p-4">
        <Typography variant="h2" className="text-center mb-6">
          Classroom Weekly Schedule
        </Typography>

        <div className="mb-6 flex gap-4 items-center">
          <Input
            label="Search Classrooms"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!border-gray-300 !focus:border-blue-500"
          />

          <Select
            label="Select Classroom"
            value={selectedClassroom}
            onChange={(value) => setSelectedClassroom(value)}
          >
            {filteredClassrooms.map((classroom) => (
              <Option key={classroom} value={classroom}>
                {classroom}
              </Option>
            ))}
          </Select>
        </div>

        {renderTable()}
      </div>
    </div>
  );
};

export default WeeklyClassroomTimetable;
