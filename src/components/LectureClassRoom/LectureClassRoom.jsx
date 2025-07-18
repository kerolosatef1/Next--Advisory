import React, { useState, useEffect } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import "highcharts/modules/accessibility";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../Loading/Loading";
import Slidebar from "../Slidebar/Slidebar";

const ClassroomAnalysis = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [emptyClassrooms, setEmptyClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSlotColors, setTimeSlotColors] = useState({});

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [lectureResponse, emptyResponse] = await Promise.all([
          axios.get(
            "https://timetableapi.runasp.net/api/AnalysisAndStatisticals/LectureClassRoom",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
          axios.get(
            "https://timetableapi.runasp.net/api/AnalysisAndStatisticals/ClassRoomLectureNotMapped",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
        ]);

        setClassrooms(lectureResponse.data);
        setEmptyClassrooms(emptyResponse.data);

        // Generate unique colors for each time slot
        const colors = {};
        const allTimeSlots = new Set();

        lectureResponse.data.forEach((classroom) => {
          Object.keys(classroom.eachTimeSlot).forEach((timeSlot) => {
            allTimeSlots.add(timeSlot);
          });
        });

        const colorPalette = [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC24A",
          "#F06292",
          "#7986CB",
          "#FF7043",
        ];

        Array.from(allTimeSlots).forEach((timeSlot, index) => {
          colors[timeSlot] = colorPalette[index % colorPalette.length];
        });

        setTimeSlotColors(colors);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(`❌ Error fetching data: ${err.message}`);
      }
    };

    fetchClassroomData();
  }, []);

  const prepareChartData = () => {
    const classroomMap = {};
    classrooms.forEach((classroom) => {
      classroomMap[classroom.classRoomName] = classroom;
    });

    // Use only occupied classrooms for the chart (sorted alphabetically)
    const chartClassrooms = [...classrooms].sort((a, b) => 
      a.classRoomName.localeCompare(b.classRoomName)
    );

    const dynamicHeight = Math.max(400, chartClassrooms.length * 70);

    const seriesData = chartClassrooms.map(classroom => ({
      y: classroom.totalAssigned,
      name: classroom.classRoomName,
      timeSlots: classroom.eachTimeSlot,
      color: "#3b82f6", // Single color for all bars (blue-500)
    }));

    return {
      chartOptions: {
        chart: {
          type: "bar",
          height: dynamicHeight,
          backgroundColor: "#f8fafc",
        },
        title: {
          text: "Lecture Hall Utilization Analysis",
          style: {
            color: "#1e293b",
            fontSize: "24px",
          },
        },
        subtitle: {
          text: `Showing ${classrooms.length} occupied lecture halls`,
          style: {
            color: "#64748b"
          }
        },
        xAxis: {
          categories: chartClassrooms.map(c => c.classRoomName),
          title: {
            text: "Lecture Halls",
            style: {
              color: "#475569",
            },
          },
          labels: {
            style: {
              color: "#475569",
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Number of Lectures",
            style: {
              color: "#475569",
            },
          },
          labels: {
            style: {
              color: "#475569",
            },
          },
          gridLineColor: "#e2e8f0",
        },
        tooltip: {
          useHTML: true,
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: 8,
          borderWidth: 1,
          shadow: true,
          style: {
            color: "#1e293b",
            width: "300px",
          },
          formatter: function () {
            const classroom = classroomMap[this.point.name];
            if (!classroom)
              return '<div class="p-2 text-red-500">Data not available</div>';

            return `
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-slate-800 border-b pb-2">
                  ${classroom.classRoomName}
                </h3>
                
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Total Assigned:</span>
                  <span class="font-bold text-slate-800">${
                    classroom.totalAssigned
                  }</span>
                </div>
                
                <div class="pt-2 border-t mt-2">
                  <h4 class="font-bold text-slate-700 mb-2">Time Slot Distribution:</h4>
                  <div class="space-y-1 max-h-40 overflow-y-auto">
                    ${Object.entries(classroom.eachTimeSlot)
                      .sort((a, b) => b[1] - a[1])
                      .map(
                        ([timeSlot, count]) => `
                        <div class="flex justify-between items-center py-1">
                          <div class="flex items-center">
                            <span class="w-2 h-2 rounded-full mr-2" 
                              style="background-color: ${
                                timeSlotColors[timeSlot] || "#94a3b8"
                              }"></span>
                            <span class="text-slate-600">${timeSlot}:</span>
                          </div>
                          <span class="font-bold text-slate-800">${count}</span>
                        </div>
                      `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            `;
          },
        },
        plotOptions: {
          bar: {
            color: "#3b82f6", // Single color for all bars
            dataLabels: {
              enabled: true,
              style: {
                color: "#1e293b",
                textOutline: "none",
                fontSize: "12px",
              },
            },
            states: {
              hover: {
                borderColor: "#94a3b8",
                borderWidth: 1,
              },
            },
          },
        },
        series: [
          {
            name: "Lectures Assigned",
            data: seriesData,
            color: "#3b82f6" // Single color for all bars
          },
        ],
        credits: {
          enabled: false,
        },
        accessibility: {
          enabled: true,
        },
      },
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Lecture Hall Utilization Analysis
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <HighchartsReact
            highcharts={Highcharts}
            options={chartData.chartOptions}
          />
        </div>

        {/* Empty Classrooms Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Empty Classrooms ({emptyClassrooms.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {emptyClassrooms.map((classroom, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"
              >
                <span className="font-medium text-gray-700">{classroom}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomAnalysis;