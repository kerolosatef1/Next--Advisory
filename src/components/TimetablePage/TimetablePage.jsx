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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const WeeklyTimetable = () => {
  const [organizedData, setOrganizedData] = useState({});
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const handlePrint = () => {
  if (!selectedYear || !selectedGroup || !tableRef.current) return;

  toast.info('جاري إنشاء ملف PDF...', { autoClose: 2000 });

  // استخدام html2canvas لالتقاط لقطة للجدول مع التنسيق
  html2canvas(tableRef.current, {
    scale: 2, // زيادة الدقة
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // حساب أبعاد الصورة
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgHeight / imgWidth;
    const pdfWidth = pageWidth - 20; // هامش 10مم من كل جانب
    const pdfHeight = pdfWidth * ratio;
    
    // إضافة الصورة إلى PDF
    pdf.addImage(imgData, 'PNG', 10, 20, pdfWidth, pdfHeight);

    // إضافة رأس المستند
    pdf.setFontSize(30);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Academic Year: ${selectedYear}`, pageWidth / 2, 10, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(`Group: ${selectedGroup}`, pageWidth / 2, 16, { align: 'center' });

    // حفظ الملف
    pdf.save(`Timetable_${selectedYear}_${selectedGroup}.pdf`);
    toast.success('تم إنشاء ملف PDF بنجاح');
  }).catch((error) => {
    toast.error('حدث خطأ أثناء إنشاء الملف');
    console.error('Error generating PDF:', error);
  });
};

  const exportToWord = () => {
  if (!selectedYear || !selectedGroup || !tableRef.current) return;

  toast.info('جاري إنشاء ملف Word...', { autoClose: 2000 });

  // استخدام نفس تقنية html2canvas لضمان التطابق التام
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
        <h2 style="color:#2d3748;margin:0;font-size:60px;">Academic Year: ${selectedYear}</h2>
        <h3 style="color:#4a5568;margin:5px 0 0;font-size:50px;">Group: ${selectedGroup}</h3>
      </div>
    `;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="UTF-8">
          <title>Weekly Timetable</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${header}
          <img src="${imgData}" alt="Timetable" />
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Timetable_${selectedYear}_${selectedGroup}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم إنشاء ملف Word بنجاح');
  }).catch((error) => {
    toast.error('حدث خطأ أثناء إنشاء الملف');
    console.error('Error generating Word:', error);
  });
};

  const exportToExcel = () => {
    // إنشاء بيانات Excel مع الهيدر
    const csvContent = [
      `Academic Year,${selectedYear}\nGroup,${selectedGroup}\n\n`,
      "Day,Time,Course,Professor,Room,Type\n",
      ...daysOfWeek.flatMap((day) =>
        timeSlots.flatMap((time) => {
          const lectures =
            organizedData[selectedYear]?.[selectedGroup]?.[day.id]?.[time] ||
            [];
          return lectures.map(
            (lecture) =>
              `${day.name},${time},${lecture.course},${lecture.professor},${lecture.room},${lecture.type}`
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
    link.download = `Timetable_${selectedYear}_${selectedGroup}.csv`;
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
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-700">
                <tr>
                  <th className=" text-white font-bold border border-blue-600">
                    Day/Time
                  </th>
                  {timeSlots.map((time) => {
                    const [start, end] = time.split("-");
                    return (
                      <th
                        key={time}
                        className="py-2 px-1 text-white text-xs   sm:text-xs md:text-sm font-bold border border-blue-600 min-w-[60px] max-w-[100px] truncate"
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
                    <td className="p-3 font-semibold text-white text-center bg-slate-600  border border-gray-300">
                      {day.name}
                    </td>
                    {timeSlots.map((time) => (
                      <td key={time} className="p-3 border border-gray-300">
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
                            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-1 md:gap-0">
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
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 mb-3 md:gap-3">
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

        
          {renderTable()}
        </div>
      </div>
    </>
  );
};

export default WeeklyTimetable;