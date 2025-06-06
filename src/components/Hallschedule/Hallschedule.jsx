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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  
// دالة تصدير PDF
const exportToPDF = () => {
  if (!selectedClassroom || !tableRef.current) return;

  toast.info('جاري إنشاء ملف PDF...', { autoClose: 2000 });

  html2canvas(tableRef.current, {
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgHeight / imgWidth;
    const pdfWidth = pageWidth - 20;
    const pdfHeight = pdfWidth * ratio;
    
    pdf.addImage(imgData, 'PNG', 10, 20, pdfWidth, pdfHeight);

    // إضافة رأس المستند
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Classroom: ${selectedClassroom}`, pageWidth / 2, 10, { align: 'center' });

    pdf.save(`Classroom_Timetable_${selectedClassroom}.pdf`);
    toast.success('تم إنشاء ملف PDF بنجاح');
  }).catch((error) => {
    toast.error('حدث خطأ أثناء إنشاء الملف');
    console.error('Error generating PDF:', error);
  });
};

// دالة تصدير Word
const exportToWord = () => {
  if (!selectedClassroom || !tableRef.current) return;

  toast.info('جاري إنشاء ملف Word...', { autoClose: 2000 });

  html2canvas(tableRef.current, {
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    
    const header = `
      <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #e2e8f0;padding-bottom:15px;">
        <h2 style="color:#2d3748;margin:0;font-size:22px;">Classroom: ${selectedClassroom}</h2>
      </div>
    `;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="UTF-8">
          <title>Classroom Timetable</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${header}
          <img src="${imgData}" alt="Classroom Timetable" />
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Classroom_Timetable_${selectedClassroom}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم إنشاء ملف Word بنجاح');
  }).catch((error) => {
    toast.error('حدث خطأ أثناء إنشاء الملف');
    console.error('Error generating Word:', error);
  });
};

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
                  className=" text-white text-[10px] md:text-sm font-bold border border-blue-600"
                >
                  {time.split("-").join(" - ")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {daysOfWeek.map((day) => (
              <tr key={day.id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold text-white text-center bg-slate-600 border-gray-300">
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

        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 mb-3 md:gap-3">
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

<div className="flex gap-4 mb-6 justify-center">
  <button
    onClick={exportToPDF}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
    </svg>
    Export PDF
  </button>

  <button
    onClick={exportToWord}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
    Export Word
  </button>
</div>
        {renderTable()}
        
      </div>
    </div>
  );
};

export default WeeklyClassroomTimetable;
