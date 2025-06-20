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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const handlePrint = () => {
    if (!selectedProfessor || !tableRef.current) return;

    toast.info("Generating PDF...", { autoClose: 2000 });

    html2canvas(tableRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF("landscape", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgHeight / imgWidth;
        const pdfWidth = pageWidth - 20;
        const pdfHeight = pdfWidth * ratio;

        pdf.addImage(imgData, "PNG", 10, 20, pdfWidth, pdfHeight);

        // Add document header
        pdf.setFontSize(18);
        pdf.setTextColor(40, 40, 40);
        pdf.text(`Professor: ${selectedProfessor}`, pageWidth / 2, 10, {
          align: "center",
        });

        pdf.save(`Professor_Timetable_${selectedProfessor}.pdf`);
        
      })
      .catch((error) => {
        toast.error("Error generating PDF");
        console.error("Error generating PDF:", error);
      });
  };

  const exportToWord = () => {
    if (!selectedProfessor || !tableRef.current) return;

    toast.info("Generating Word document...", { autoClose: 2000 });

    html2canvas(tableRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        const header = `
      <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #e2e8f0;padding-bottom:15px;">
        <h2 style="color:#2d3748;margin:0;font-size:40px;font-weight: bold;">Professor: ${selectedProfessor}</h2>
      </div>
    `;

        const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="UTF-8">
          <title>Professor Timetable</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${header}
          <img src="${imgData}" alt="Professor Timetable" />
        </body>
      </html>
    `;

        const blob = new Blob(["\ufeff", htmlContent], {
          type: "application/msword",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Professor_Timetable_${selectedProfessor}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
      })
      .catch((error) => {
        toast.error("Error generating Word document");
        console.error("Error generating Word:", error);
      });
  };

  const exportToExcel = () => {
    const csvContent = [
      `Professor,${selectedProfessor}\n\n`,
      "Day,Time,Course,Group,Room,Year\n",
      ...daysOfWeek.flatMap((day) =>
        timeSlots.flatMap((time) => {
          const lectures =
            organizedData[selectedProfessor]?.[day.id]?.[time] || [];
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
              <th className="p-3 text-white font-bold border border-blue-600 sticky left-0 z-10 min-w-[80px]">
                Day/Time
              </th>
              {timeSlots.map((time) => (
                <th
                  key={time}
                  className="py-2 px-1 text-white text-xs sm:text-xs md:text-sm font-bold border border-blue-600 min-w-[60px] max-w-[100px] truncate"
                >
                  {time.replace("-", " - ")}
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
        <Typography variant="h2" className="text-center mb-6">
          Professor Schedule
        </Typography>
        
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                clipRule="evenodd"
              />
            </svg>
            Export PDF
          </button>

          <button
            onClick={exportToWord}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Export Word
          </button>

          <button
            onClick={exportToExcel}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528a6 6 0 01-1.528-2V8.414A2 2 0 0010.586 7H8V5a1 1 0 011-1h1V3a1 1 0 10-2 0v1H6a2 2 0 00-2 2v1.528a6 6 0 01-2 1.528V4z"
                clipRule="evenodd"
              />
            </svg>
            Export Excel
          </button>
        </div>
        
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