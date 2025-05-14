import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../Loading/Loading";
import Slidebar from "./../Slidebar/Slidebar";

const WeeklyHallSchedule = () => {
  const [organizedData, setOrganizedData] = useState({});
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const years = {};
    const allTimeSlots = new Set();

    data.flat().forEach((entry) => {
      if (!entry.time_slot) {
        console.warn("Missing time slot:", entry);
        return;
      }

      const normalizedTime = normalizeTime(entry.time_slot);
      console.log("Original:", entry.time_slot, "Normalized:", normalizedTime);

      const year = entry.year;
      const group = entry.name_group;
      const day = entry.day;

      if (!years[year]) years[year] = {};
      if (!years[year][group]) years[year][group] = {};
      if (!years[year][group][day]) years[year][group][day] = {};
      if (!years[year][group][day][normalizedTime]) {
        years[year][group][day][normalizedTime] = [];
      }

      years[year][group][day][normalizedTime].push({
        course: entry.name_course,
        professor: entry.name_professor_or_teaching_assistant,
        room: entry.room,
        type: entry.type,
      });

      allTimeSlots.add(normalizedTime);
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
      return timeToMinutes(a) - timeToMinutes(b);
    });

    setTimeSlots(sortedTimeSlots);
    return years;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          toast.error("يجب تسجيل الدخول أولاً");
          return;
        }

        const response = await axios.get(
          "https://timetableapi.runasp.net/api/schedule/TimeTable",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        if (!response.data) {
          toast.error("Not data Availibale");
          return;
        }

        const organized = organizeData(response.data);
        setOrganizedData(organized);

        
        const firstYear = Object.keys(organized)[0] || "";
        const firstGroup = organized[firstYear]
          ? Object.keys(organized[firstYear])[0]
          : "";
        setSelectedYear(firstYear);
        setSelectedGroup(firstGroup);
      } catch (error) {
        if (error.code === "ECONNABORTED") {
          toast.error("انتهت مهلة الاتصال");
        } else {
          toast.error("Failed on loading TimeTable");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  // عرض الجدول
  const renderTable = () => {
    if (!organizedData[selectedYear]?.[selectedGroup]) return null;

    return (
      <>
        <div className="overflow-x-auto  ">
          <table className="min-w-full bg-bodytable border-collapse">
            <thead className="bg-orange-300">
              <tr className="bg-days">
                <th className=" p-2 border">days/time</th>
                {timeSlots.map((time) => {
                  const [start, end] = time.split("-");
                  return (
                    <th key={time} className="bg-hours p-2 border">
                      {start} - {end}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="">
              {daysOfWeek.map((day) => (
                <tr key={day.id}>
                  <td className="bg-days text-center p-2 border font-bold">
                    {day.name}
                  </td>
                  {timeSlots.map((time) => (
                    <td key={time} className="p-2 border min-w-[200px]">
                      {organizedData[selectedYear][selectedGroup][day.id]?.[
                        time
                      ]?.map((lecture, idx) => (
                        <div
                          key={idx}
                          className={`mb-2 p-2 rounded ${
                            lecture.type === "lecture"
                              ? "bg-lecture"
                              : "bg-sections"
                          }`}
                        >
                          <div className="flex text-white justify-between">
                            <span className=" font-bold text-white">
                              {lecture.course}
                            </span>
                            <span className="text-sm text-white">
                              {lecture.type === "lecture"
                                ? "Lecture"
                                : "Section"}
                            </span>
                          </div>
                          <div className="text-sm text-white">
                            <div> {lecture.professor}</div>
                            <div> {lecture.room || "غير محدد"}</div>
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
      </>
    );
  };

  return (
    <>
      <div className="background-main-pages ">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md  sm:px-6 ">
          <Typography
            variant="h2"
            className="text-center font-mono text-5xl mb-6"
          >
            Weekly Study Schedule
          </Typography>

          {/* فلترات التحديد */}
          <div className="flex gap-4 mb-6">
            <Select
              label="select the year"
              value={selectedYear}
              onChange={(value) => {
                setSelectedYear(value);
                setSelectedGroup(Object.keys(organizedData[value])[0]);
              }}
            >
              {Object.keys(organizedData).map((year) => (
                <Option key={year} value={year}>
                  Year {year}
                </Option>
              ))}
            </Select>

            <Select
              label="select the group"
              value={selectedGroup}
              onChange={(value) => setSelectedGroup(value)}
            >
              {selectedYear &&
                organizedData[selectedYear] &&
                Object.keys(organizedData[selectedYear]).map((group) => (
                  <Option key={group} value={group}>
                    group {group}
                  </Option>
                ))}
            </Select>
          </div>

          {/* عرض الجدول */}
          {renderTable()}
        </div>
      </div>
    </>
  );
};

export default WeeklyHallSchedule;
