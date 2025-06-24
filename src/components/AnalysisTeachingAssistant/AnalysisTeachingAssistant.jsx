import React, { useState, useEffect } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import "highcharts/modules/accessibility";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";

const TeachingAssistantAnalysis = () => {
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [unassignedAssistants, setUnassignedAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSlotColors, setTimeSlotColors] = useState({});

  useEffect(() => {
    const fetchTeachingAssistantData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [assistantsResponse, unassignedResponse] = await Promise.all([
          axios.get(
            "https://timetableapi.runasp.net/api/AnalysisAndStatisticals/TeachingAssistant",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
          axios.get(
            "https://timetableapi.runasp.net/api/AnalysisAndStatisticals/TeachingAssistantNotMapped",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
        ]);

        setTeachingAssistants(assistantsResponse.data);
        setUnassignedAssistants(unassignedResponse.data);

        // Generate unique colors for each time slot
        const colors = {};
        const allTimeSlots = new Set();

        assistantsResponse.data.forEach((assistant) => {
          Object.keys(assistant.eachTimeSlotNo).forEach((timeSlot) => {
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
          "#A1887F",
          "#4DB6AC",
          "#E57373",
          "#64B5F6",
          "#BA68C8",
          "#9575CD",
          "#4FC3F7",
          "#81C784",
          "#FFF176",
          "#FF8A65",
          "#F48FB1",
          "#90CAF9",
          "#AED581",
          "#FFD54F",
          "#A1887F",
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

    fetchTeachingAssistantData();
  }, []);

  const prepareAssistantChartData = () => {
    const categories = teachingAssistants.map((ta) => ta.professorName);
    const lectureData = teachingAssistants.map((ta) => ta.totalLectural);
    const daysData = teachingAssistants.map((ta) => ta.numberDays);

    const dynamicHeight = Math.max(400, categories.length * 80);

    return {
      chartOptions: {
        chart: {
          type: "bar",
          height: dynamicHeight,
          backgroundColor: "#f8fafc",
        },
        title: {
          text: "Teaching Assistant Statistics",
          style: {
            color: "#1e293b",
            fontSize: "24px",
            fontWeight: "600",
          },
        },
        xAxis: {
          categories: categories,
          crosshair: true,
          labels: {
            style: {
              color: "#475569",
              fontSize: "14px",
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Count",
            style: {
              color: "#475569",
              fontSize: "15px",
            },
          },
          labels: {
            style: {
              color: "#475569",
              fontSize: "14px",
            },
          },
          gridLineColor: "#e2e8f0",
        },
        tooltip: {
          headerFormat:
            '<span style="font-size:14px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderRadius: 8,
          borderWidth: 1,
          shadow: true,
        },
        plotOptions: {
          bar: {
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              style: {
                color: "#1e293b",
                fontSize: "14px",
                textOutline: "none",
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
            name: "Total Lectures",
            data: lectureData,
            color: "#3b82f6",
          },
          {
            name: "Teaching Days",
            data: daysData,
            color: "#10b981",
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

  const prepareTimeSlotChartData = () => {
    const timeSlots = {};

    teachingAssistants.forEach((ta) => {
      Object.entries(ta.eachTimeSlotNo).forEach(([timeSlot, count]) => {
        timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + count;
      });
    });

    const sortedTimeSlots = Object.entries(timeSlots)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      chartOptions: {
        chart: {
          type: "bar",
          height: 400,
          backgroundColor: "#f8fafc",
        },
        title: {
          text: "Top Teaching Time Slots",
          style: {
            color: "#1e293b",
            fontSize: "24px",
            fontWeight: "600",
          },
        },
        xAxis: {
          categories: sortedTimeSlots.map((item) => item[0]),
          title: {
            text: null,
          },
          labels: {
            style: {
              color: "#475569",
              fontSize: "14px",
            },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Lecture Count",
            align: "high",
            style: {
              color: "#475569",
              fontSize: "16px",
            },
          },
          labels: {
            style: {
              color: "#475569",
              fontSize: "14px",
            },
          },
          gridLineColor: "#e2e8f0",
        },
        plotOptions: {
          bar: {
            color: "#ef4444",
            dataLabels: {
              enabled: true,
              style: {
                color: "#1e293b",
                fontSize: "14px",
                textOutline: "none",
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
            name: "Lectures",
            data: sortedTimeSlots.map((item) => item[1]),
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

  const prepareAssistantStats = () => {
    return teachingAssistants.map((ta) => ({
      name: ta.professorName,
      lectures: ta.totalLectural,
      days: ta.numberDays,
      timeSlots: ta.eachTimeSlotNo,
    }));
  };

  const prepareTimeSlotStats = () => {
    const timeSlots = {};

    teachingAssistants.forEach((ta) => {
      Object.entries(ta.eachTimeSlotNo).forEach(([timeSlot, count]) => {
        timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + count;
      });
    });

    return Object.entries(timeSlots)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
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

  const assistantChartData = prepareAssistantChartData();
  const timeSlotChartData = prepareTimeSlotChartData();
  const assistantStats = prepareAssistantStats();
  const timeSlotStats = prepareTimeSlotStats();
  const totalLectures = assistantStats.reduce(
    (sum, ta) => sum + ta.lectures,
    0
  );
  const totalTimeSlots = timeSlotStats.reduce(
    (sum, slot) => sum + slot.count,
    0
  );

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="min-h-screen p-4 md:p-8">
        <header className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Teaching Assistant Analysis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Distribution of teaching assignments across assistants and time
            slots
          </p>
        </header>

        <main className="max-w-7xl mx-auto space-y-8">
          {/* Assistant Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <HighchartsReact
              highcharts={Highcharts}
              options={assistantChartData.chartOptions}
            />
          </div>

          {/* Time Slot Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <HighchartsReact
              highcharts={Highcharts}
              options={timeSlotChartData.chartOptions}
            />
          </div>

          {/* Assistant Statistics */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
              Teaching Assistant Statistics ({assistantStats.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assistantStats.map((assistant, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-bold text-gray-700 text-center mb-2">
                    {assistant.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Lectures:{" "}
                      <span className="font-bold">{assistant.lectures}</span>
                      <span className="text-sm ml-2 text-gray-500">
                        (
                        {(
                          (assistant.lectures / totalLectures) * 100 || 0
                        ).toFixed(1)}
                        %)
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Teaching Days:{" "}
                      <span className="font-bold">{assistant.days}</span>
                    </p>
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Top Time Slots:
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(assistant.timeSlots)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([timeSlot, count]) => (
                            <div
                              key={timeSlot}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <span
                                  className="w-2 h-2 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      timeSlotColors[timeSlot] || "#94a3b8",
                                  }}
                                ></span>
                                <span className="text-gray-600 text-sm">
                                  {timeSlot}:
                                </span>
                              </div>
                              <span className="font-bold text-gray-700 text-sm">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Assistants */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
              Unassigned Teaching Assistants ({unassignedAssistants.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unassignedAssistants.map((assistant, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center hover:shadow-sm transition-shadow"
                >
                  <span className="font-medium text-gray-700">{assistant}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeachingAssistantAnalysis;
