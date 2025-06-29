import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { Input, Typography, Select, Option,Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button } from "@material-tailwind/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../Loading/Loading";
import Slidebar from "../Slidebar/Slidebar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const StudentTimetable = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const daysOfWeek = useMemo(
    () => [
      { id: "1", name: "Saturday" },
      { id: "2", name: "Sunday" },
      { id: "3", name: "Monday" },
      { id: "4", name: "Tuesday" },
      { id: "5", name: "Wednesday" },
      { id: "6", name: "Thursday" },
      { id: "7", name: "Friday" },
    ],
    []
  );

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
    const endMinutes = toMinutes(times[1]);

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

  const organizeStudentData = useCallback(
    (studentCourses) => {
      const organizedData = {};
      const allTimeSlots = new Set();

      studentCourses.forEach((course) => {
        if (!course.timeSlot) {
          console.warn("Missing time slot:", course);
          return;
        }

        const normalizedTime = normalizeTime(course.timeSlot);
        const day = course.day;

        if (!organizedData[day]) organizedData[day] = {};
        if (!organizedData[day][normalizedTime]) {
          organizedData[day][normalizedTime] = [];
        }

        organizedData[day][normalizedTime].push({
          course: course.nameCourse,
          professor: course.nameProfessorOrTeachingAssistant,
          room: course.room,
          type: course.type,
            
        });

        allTimeSlots.add(normalizedTime);
      });

      const sortedTimeSlots = Array.from(allTimeSlots).sort((a, b) => {
        return timeToMinutes(a) - timeToMinutes(b);
      });

      setTimeSlots(sortedTimeSlots);
      return organizedData;
    },
    [normalizeTime, timeToMinutes]
  );
  const timetableData = useMemo(() => {
    if (!selectedStudent) return null;
    return organizeStudentData(selectedStudent.courses);
  }, [selectedStudent, organizeStudentData]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentsData;

    return studentsData.filter((group) => {
      if (!group[0]) return false;
      const student = group[0];
      const searchLower = searchTerm.toLowerCase();

      return (
        student.studentId.toLowerCase().includes(searchLower) ||
        student.studentName.toLowerCase().includes(searchLower)
      );
    });
  }, [studentsData, searchTerm]);
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const response = await axios.get(
        "https://timetableapi.runasp.net/api/Schedule/AllUniqueStudent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (!response.data || response.data.length === 0) {
        toast.error("No student data available");
        return;
      }

      setStudentsData(response.data);

      if (
        !selectedStudent &&
        response.data.length > 0 &&
        response.data[0].length > 0
      ) {
        setSelectedStudent({
          studentName: response.data[0][0].studentName,
          studentId: response.data[0][0].studentId,
          courses: response.data[0],
        });
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout");
      } else {
        toast.error("Failed to load student timetable");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

 const handlePrint = useCallback(() => {
  if (!selectedStudent || !tableRef.current) return;

  

  // احصل على عنصر الجدول
  const tableElement = tableRef.current;
  
  // احسب الأبعاد المطلوبة للجدول
  const tableWidth = tableElement.scrollWidth;
  const tableHeight = tableElement.scrollHeight;
  
  // أضف هامش إضافي للرأس
  const margin = 20;
  const totalHeight = tableHeight + margin;

  // قم بإنشاء عنصر مؤقت لاحتواء الجدول
  const tempElement = document.createElement('div');
  tempElement.style.position = 'absolute';
  tempElement.style.left = '-9999px';
  tempElement.style.width = `${tableWidth}px`;
  tempElement.style.height = `${totalHeight}px`;
  tempElement.style.overflow = 'visible';
  
  // نسخ الجدول إلى العنصر المؤقت
  const tableClone = tableElement.cloneNode(true);
  tempElement.appendChild(tableClone);
  document.body.appendChild(tempElement);

  html2canvas(tempElement, {
    scale: 2,
    width: tableWidth,
    height: totalHeight,
    scrollX: 0,
    scrollY: 0,
    windowWidth: tableWidth,
    windowHeight: totalHeight,
    useCORS: true,
    allowTaint: true,
    letterRendering: true,
    backgroundColor: '#ffffff'
  }).then((canvas) => {
    // احسب نسبة العرض إلى الارتفاع
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const aspectRatio = imgWidth / imgHeight;

    // إنشاء PDF مع الاتجاه المناسب
    const pdf = new jsPDF({
      orientation: aspectRatio > 1 ? 'landscape' : 'portrait',
      unit: 'mm'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // حساب الأبعاد مع الحفاظ على النسبة
    let finalWidth = pageWidth - 20;
    let finalHeight = finalWidth / aspectRatio;

    // إذا كان الارتفاع أكبر من الصفحة، اضبط العرض بناءً على الارتفاع
    if (finalHeight > pageHeight - 20) {
      finalHeight = pageHeight - 20;
      finalWidth = finalHeight * aspectRatio;
    }

    // إضافة الصورة في منتصف الصفحة
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    pdf.addImage(canvas, 'PNG', x, y, finalWidth, finalHeight);

    // إضافة معلومات الطالب في أعلى الصفحة
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Student: ${selectedStudent.studentName}`, pageWidth / 2, 10, { align: 'center' });
    pdf.text(`ID: ${selectedStudent.studentId}`, pageWidth / 2, 15, { align: 'center' });

    pdf.save(`Timetable_${selectedStudent.studentName}_${selectedStudent.studentId}.pdf`);
   
    
    // تنظيف العنصر المؤقت
    document.body.removeChild(tempElement);
  }).catch((error) => {
    toast.error('حدث خطأ أثناء إنشاء الملف');
    console.error('Error generating PDF:', error);
    document.body.removeChild(tempElement);
  });
}, [selectedStudent]);
const handleDeleteStudent = useCallback(async () => {
  if (!selectedStudent) return;

  try {
    setLoading(true);
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    await axios.delete(
      `https://timetableapi.runasp.net/api/Schedule/DeleteStudent/${selectedStudent.studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.success("Student timetable deleted successfully");
    // Refresh the data after deletion
    await fetchData();
    setSelectedStudent(null);
  } catch (error) {
    toast.error("Failed to delete student timetable");
    console.error("Delete error:", error);
  } finally {
    setLoading(false);
    setDeleteDialogOpen(false);
  }
}, [selectedStudent, fetchData]);

const openDeleteDialog = () => {
  if (selectedStudent) {
    setDeleteDialogOpen(true);
  }
};
const exportToWord = useCallback(() => {
  if (!selectedStudent || !tableRef.current) return;

  

  // تحديد أبعاد الجدول
  const table = tableRef.current;
  const tableWidth = table.scrollWidth;
  const tableHeight = table.scrollHeight;

  html2canvas(table, {
    scale: 2,
    width: tableWidth,
    height: tableHeight,
    scrollX: 0,
    scrollY: 0,
    windowWidth: tableWidth,
    windowHeight: tableHeight,
    useCORS: true,
    allowTaint: true,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    
    const header = `
      <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #e2e8f0;padding-bottom:15px;">
        <h2 style="color:#2d3748;margin:0;font-size:24px;">Student: ${selectedStudent.studentName}</h2>
        <h3 style="color:#4a5568;margin:5px 0 0;font-size:18px;">ID: ${selectedStudent.studentId}</h3>
      </div>
    `;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="UTF-8">
          <title>Student Timetable</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .timetable-image {
              width: 100%;
              height: auto;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${header}
          <img src="${imgData}" class="timetable-image" alt="Timetable" />
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Timetable_${selectedStudent.studentName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  }).catch((error) => {
    toast.error('حدث خطأ أثناء إنشاء الملف');
    console.error('Error generating Word:', error);
  });
}, [selectedStudent]);

  const exportToExcel = useCallback(() => {
    if (!selectedStudent || !timetableData) return;

    // إنشاء بيانات Excel
    let csvContent = "Day,Time,Course,Professor,Room,Type\n";

    daysOfWeek.forEach((day) => {
      timeSlots.forEach((time) => {
        const lectures = timetableData[day.id]?.[time] || [];
        lectures.forEach((lecture) => {
          csvContent += `${day.name},${time},${lecture.course},${
            lecture.professor
          },${lecture.room || "N/A"},${lecture.type}\n`;
        });
      });
    });

    const blob = new Blob(["\ufeff", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Timetable_${selectedStudent.studentName}_${selectedStudent.studentId}.csv`;
    link.click();
  }, [selectedStudent, timetableData, daysOfWeek, timeSlots]);

  const handleStudentSelect = useCallback(
    (value) => {
      const selected = studentsData.find(
        (group) =>
          group[0] &&
          `${group[0].studentName} - ${group[0].studentId}` === value
      );
      if (selected) {
        setSelectedStudent({
          studentName: selected[0].studentName,
          studentId: selected[0].studentId,
          courses: selected,
        });
      }
    },
    [studentsData]
  );
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);
  const studentOptions = useMemo(
    () =>
      filteredStudents.map(
        (studentGroup, index) =>
          studentGroup[0] && (
            <Option
              key={`${studentGroup[0].studentId}-${index}`}
              value={`${studentGroup[0].studentName} - ${studentGroup[0].studentId}`}
            >
              {studentGroup[0].studentName} - {studentGroup[0].studentId}
            </Option>
          )
      ),
    [filteredStudents]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  return <>
    {/* Delete Confirmation Dialog */}
<Dialog
  open={deleteDialogOpen}
  handler={() => setDeleteDialogOpen(!deleteDialogOpen)}
  animate={{
    mount: { scale: 1, y: 0 },
    unmount: { scale: 0.9, y: -100 },
  }}
>
  <DialogHeader>Confirm Deletion</DialogHeader>
  <DialogBody>
    Are you sure you want to delete the timetable for {selectedStudent?.studentName} ID: {selectedStudent?.studentId} ?
   
  </DialogBody>
  <DialogFooter>
    <Button
      variant="text"
      color="gray"
      onClick={() => setDeleteDialogOpen(false)}
      className="mr-1"
    >
      <span>Cancel</span>
    </Button>
    <Button 
      variant="gradient" 
      color="red" 
      onClick={handleDeleteStudent}
      disabled={loading}
    >
      <span>{loading ? "Deleting..." : "Confirm Delete"}</span>
    </Button>
  </DialogFooter>
</Dialog>
    
    <div className="background-main-pages">
      <Slidebar />
      <div className="max-w-screen-xl mx-auto rounded-md sm:px-6">
        <Typography
          variant="h2"
          className="text-center font-mono text-5xl mb-6"
        >
          All Special Student Weekly Timetable
        </Typography>
        <div className="flex-1 py-5">
          <Input
            label="Search by ID or Name"
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-white"
          />
        </div>
        <div className="mb-6">
          <Select
            label="Select Student"
            value={
              selectedStudent
                ? `${selectedStudent.studentName} - ${selectedStudent.studentId}`
                : ""
            }
            onChange={handleStudentSelect}
          >
            {studentOptions}
          </Select>
        </div>

        <div className="flex gap-4 mb-6 justify-center">
          <button
  onClick={handlePrint}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
  disabled={!selectedStudent}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
  </svg>
  Export PDF
</button>
          <button
            onClick={exportToWord}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedStudent}
          >
            Export Word
          </button>
          <button
            onClick={exportToExcel}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedStudent}
          >
            Export Excel
          </button>
          <button
  onClick={openDeleteDialog}
  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
  disabled={!selectedStudent}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
  Delete
</button>
        </div>

        {selectedStudent && (
          <div className="mb-6">
            <Typography variant="h3" className="mb-2 text-center">
              {selectedStudent.studentName}
            </Typography>
            <Typography variant="h5" className="text-gray-600 text-center">
              ID: {selectedStudent.studentId}
            </Typography>
          </div>
        )}

        {timetableData && (
          <div className="overflow-x-auto">
            <div  className=" " ref={tableRef}>
              <table className="min-w-full bg-white shadow-lg ">
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
                      <td className="p-3 font-semibold text-white text-center bg-slate-600 border border-gray-300">
                        {day.name}
                      </td>
                      {timeSlots.map((time) => (
                        <td key={time} className="p-2 border border-gray-300">
  {timetableData[day.id]?.[time]?.map((lecture, idx) => (
    <div
      key={idx}
      className={`${lecture.type === "lecture" ? "bg-lecture" : "bg-sections"}`}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold text-sm">{lecture.course}</span>
        <span className="text-xs">
          {lecture.type === "lecture" ? "Lecture" : "Section"}
        </span>
      </div>
      <div className="text-xs">
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
        )}
      </div>
    </div>
  </>
};

export default StudentTimetable;
