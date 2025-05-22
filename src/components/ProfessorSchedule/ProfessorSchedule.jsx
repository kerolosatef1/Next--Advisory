import { useEffect, useState, useRef } from "react";
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

const ProfessorTimetable = () => {
  const [organizedData, setOrganizedData] = useState({});
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const daysOfWeek = [
    { id: "1", name: "Saturday" },
    { id: "2", name: "Sunday" },
    { id: "3", name: "Monday" },
    { id: "4", name: "Tuesday" },
    { id: "5", name: "Wednesday" },
    { id: "6", name: "Thursday" },
    { id: "7", name: "Friday" },
  ];

  // نفس دوال التصدير والطباعة من الكود السابق مع تعديل الهيدر
    const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const header = `
      <div style="text-align:center;padding:20px;background:#f0f4f8;">
        <h2 style="color:#2d3748;margin:0;">Professor: ${selectedProfessor}</h2>
      </div>
    `;
    
    const tableHtml = tableRef.current.outerHTML
      .replace(/bg-red-500/g, 'style="background-color: #ef4444 !important; color: white !important;"')
      .replace(/bg-blue-600/g, 'style="background-color: #3182ce !important; color: white !important;"');

    printWindow.document.write(`
      <html>
        <head>
          <title>Professor Timetable</title>
          <style>
            @media print {
              table { 
                border-collapse: collapse;
                width: 100%;
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact !important;
              }
              th, td {
                border: 1px solid #cbd5e0 !important;
                padding: 12px !important;
                text-align: center !important;
              }
              [style*="background-color: #3182ce"] {
                background-color: #3182ce !important;
                color: white !important;
              }
              [style*="background-color: #ef4444"] {
                background-color: #ef4444 !important;
                color: white !important;
              }
            }
          </style>
        </head>
        <body>
          ${header}
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToWord = () => {
    const header = `
      <div style="text-align:center;padding:20px;border-bottom:2px solid #e2e8f0;">
        <h2 style="color:#2d3748;margin:0;">Professor: ${selectedProfessor}</h2>
      </div>
    `;
  
    const tableHtml = tableRef.current.outerHTML
      .replace(/bg-red-500/g, 'style="background-color:#ef4444;color:white;"')
      .replace(/bg-blue-600/g, 'style="background-color:#3182ce;color:white;padding:8px;"');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="UTF-8">
          <style>
            table { 
              border-collapse: collapse;
              width: 100%;
              font-family: Arial, sans-serif;
            }
            th, td {
              border: 1px solid #cbd5e0;
              padding: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          ${header}
          ${tableHtml}
        </body>
      </html>
    `;
  
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Timetable_${selectedProfessor}.doc`;
    link.click();
  };

  const exportToExcel = () => {
    const csvContent = [
      `Professor,${selectedProfessor}\n\n`,
      "Day,Time,Course,Group,Room,Year\n",
      ...daysOfWeek.flatMap((day) =>
        timeSlots.flatMap((time) => {
          const lectures = organizedData[selectedProfessor]?.[day.id]?.[time] || [];
          return lectures.map(
            (lecture) =>
              `${day.name},${time},${lecture.course},${lecture.group},${lecture.room},${lecture.year}`
          );
        })
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Timetable_${selectedProfessor}.csv`;
    link.click();
  };

  // نفس الدوال الأخرى للتصدير مع تعديل اسم الملف والمحتوى

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
    const professors = {};
    const allTimeSlots = new Set();

    data.flat().forEach((entry) => {
      const professor = entry.name_professor;
      const normalizedTime = normalizeTime(entry.time_slot);
      const day = entry.day;

      if (!professors[professor]) professors[professor] = {};
      if (!professors[professor][day]) professors[professor][day] = {};
      if (!professors[professor][day][normalizedTime]) {
        professors[professor][day][normalizedTime] = [];
      }

      professors[professor][day][normalizedTime].push({
        course: entry.name_course,
        group: entry.group_name,
        room: entry.class_room_name,
        year: entry.year,
      });

      allTimeSlots.add(normalizedTime);
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
      return timeToMinutes(a) - timeToMinutes(b);
    });

    setTimeSlots(sortedTimeSlots);
    return professors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "https://timetableapi.runasp.net/api/Schedule/Professor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const organized = organizeData(response.data);
        setOrganizedData(organized);
        setSelectedProfessor(Object.keys(organized)[0]);
      } catch (error) {
        toast.error("Failed to load professor timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderTable = () => {
    if (!organizedData[selectedProfessor]) return null;

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
                <td className="p-3 font-semibold text-white text-center bg-slate-600 border border-gray-300">
                  {day.name}
                </td>
                {timeSlots.map((time) => (
                  <td key={time} className="p-3 border border-gray-300">
                    {organizedData[selectedProfessor][day.id]?.[time]?.map(
                      (lecture, idx) => (
                        <div
                          key={idx}
                          className="mb-2 p-2 rounded bg-blue-600 text-white"
                        >
                          <div className="font-bold">{lecture.course}</div>
                          <div>Group: {lecture.group}</div>
                          <div>Room: {lecture.room}</div>
                          <div>Year: {lecture.year}</div>
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
    return <LoadingAnimation />;
  }

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Print PDF
          </button>
          <button
            onClick={exportToWord}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            Export Word
          </button>

          <button
            onClick={exportToExcel}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            Export Excel
          </button>
        </div>

        <Typography variant="h2" className="text-center mb-6">
          Professor Schedule
        </Typography>

        <div className="mb-6">
          <Select
            label="Select Professor"
            value={selectedProfessor}
            onChange={(value) => setSelectedProfessor(value)}
          >
            {Object.keys(organizedData).map((professor) => (
              <Option key={professor} value={professor}>
                {professor}
              </Option>
            ))}
          </Select>
        </div>

        {renderTable()}
      </div>
    </div>
  );
};

export default ProfessorTimetable;
