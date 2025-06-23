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
          )
        ]);

        setTeachingAssistants(assistantsResponse.data);
        setUnassignedAssistants(unassignedResponse.data);
        
        // Generate unique colors for each time slot
        const colors = {};
        const allTimeSlots = new Set();
        
        assistantsResponse.data.forEach(assistant => {
          Object.keys(assistant.eachTimeSlotNo).forEach(timeSlot => {
            allTimeSlots.add(timeSlot);
          });
        });

        const colorPalette = [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
          "#FF9F40", "#8AC24A", "#F06292", "#7986CB", "#FF7043",
          "#A1887F", "#4DB6AC", "#E57373", "#64B5F6", "#BA68C8",
          "#9575CD", "#4FC3F7", "#81C784", "#FFF176", "#FF8A65",
          "#F48FB1", "#90CAF9", "#AED581", "#FFD54F", "#A1887F"
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
          height: dynamicHeight
        },
        title: {
          text: "Teaching Assistant Statistics",
          style: {
            fontSize: '24px'
          }
        },
        xAxis: {
          categories: categories,
          crosshair: true,
          labels: {
            style: {
              fontSize: '14px'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: "Count",
            style: {
              fontSize: '15px'
            }
          },
          labels: {
            style: {
              fontSize: '14px'
            }
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:14px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          bar: {
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              style: {
                fontSize: '14px'
              }
            }
          },
        },
        series: [
          {
            name: "Total Lectures",
            data: lectureData,
            color: "#4285F4",
          },
          {
            name: "Teaching Days",
            data: daysData,
            color: "#34A853",
          },
        ],
        credits: {
          enabled: false,
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
          height: 400
        },
        title: {
          text: "Top Teaching Time Slots",
          style: {
            fontSize: '24px'
          }
        },
        xAxis: {
          categories: sortedTimeSlots.map((item) => item[0]),
          title: {
            text: null,
          },
          labels: {
            style: {
              fontSize: '14px'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: "Lecture Count",
            align: "high",
            style: {
              fontSize: '16px'
            }
          },
          labels: {
            style: {
              fontSize: '14px'
            }
          }
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              style: {
                fontSize: '14px'
              }
            },
          },
        },
        series: [
          {
            name: "Lectures",
            data: sortedTimeSlots.map((item) => item[1]),
            color: "#EA4335",
          },
        ],
        credits: {
          enabled: false,
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

  const assistantChartData = prepareAssistantChartData();
  const timeSlotChartData = prepareTimeSlotChartData();

  return (
    <div className="background-main-pages">
      <Slidebar />
      <div className="container mx-auto sm:px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Teaching Assistant Analysis
        </h1>
        
        {/* Full-width Teaching Assistant Statistics chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <HighchartsReact
            highcharts={Highcharts}
            options={assistantChartData.chartOptions}
          />
        </div>

        {/* Time Slot section below */}
        <div className="flex flex-col gap-8 mb-8">
          {/* Time Slots chart - takes 2/3 width */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <HighchartsReact
              highcharts={Highcharts}
              options={timeSlotChartData.chartOptions}
            />
          </div>

          {/* Time Slot Color Legend - takes 1/3 width */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Time Slot Colors</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(timeSlotColors).map(([timeSlot, color]) => (
                <div 
                  key={timeSlot} 
                  className="flex items-center px-3 py-2 rounded-md text-sm"
                  style={{ backgroundColor: color, color: "white" }}
                >
                  {timeSlot}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Teaching Assistant Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Detailed Teaching Assistant Statistics
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Teaching Assistant
                  </th>
                  
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Time Slots Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-gray-200">
                {teachingAssistants.map((assistant, index) => {
                  const sortedTimeSlots = Object.entries(assistant.eachTimeSlotNo)
                    .sort((a, b) => b[1] - a[1]);
                  
                  const totalSlots = sortedTimeSlots.reduce(
                    (sum, [_, count]) => sum + count, 0
                  );

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                        {assistant.professorName}
                      </td>
                      
                      <td className="px-6 py-4 text-lg text-gray-500">
                        <div className="flex flex-col">
                          <div 
                            className="flex h-8 rounded overflow-hidden"
                            title={`Time slots: ${sortedTimeSlots.map(([time, count]) => `${time} (${count})`).join(', ')}`}
                          >
                            {sortedTimeSlots.map(([time, count]) => (
                              <div
                                key={time}
                                className="flex items-center justify-center relative group"
                                style={{
                                  width: `${(count / totalSlots) * 100}%`,
                                  backgroundColor: timeSlotColors[time],
                                }}
                              >
                                <span className="text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unassigned Teaching Assistants Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Teaching Assistants Without Assigned Lectures ({unassignedAssistants.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unassignedAssistants.map((assistant, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"
              >
                <span className="font-medium text-gray-700">{assistant}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingAssistantAnalysis;