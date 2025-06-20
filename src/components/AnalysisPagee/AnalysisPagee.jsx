import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/accessibility';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slidebar from '../Slidebar/Slidebar';
import LoadingAnimation from '../Loading/Loading';


const ProfessorAnalysis = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
          'https://timetableapi.runasp.net/api/AnalysisAndStatisticals/Professor',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setProfessors(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(`❌ Error fetching data: ${err.message}`);
      }
    };

    fetchProfessorData();
  }, []);

  // تحضير بيانات الرسم البياني للأساتذة
  const prepareProfessorChartData = () => {
    const categories = professors.map(prof => prof.professorName);
    const lectureData = professors.map(prof => prof.totalLectural);
    const daysData = professors.map(prof => prof.numberDays);

    return {
      chartOptions: {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Professor Teaching Statistics'
        },
        xAxis: {
          categories: categories,
          crosshair: true
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Count'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        series: [{
          name: 'Total Lectures',
          data: lectureData,
          color: '#4285F4'
        }, {
          name: 'Teaching Days',
          data: daysData,
          color: '#34A853'
        }],
        credits: {
          enabled: false
        }
      }
    };
  };

  // تحضير بيانات الرسم البياني للفترات الزمنية
  const prepareTimeSlotChartData = () => {
    const timeSlots = {};
    
    professors.forEach(prof => {
      Object.entries(prof.eachTimeSlotNo).forEach(([timeSlot, count]) => {
        timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + count;
      });
    });

    const sortedTimeSlots = Object.entries(timeSlots)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // نأخذ أفضل 10 فترات

    return {
      chartOptions: {
        chart: {
          type: 'bar'
        },
        title: {
          text: 'Top Teaching Time Slots'
        },
        xAxis: {
          categories: sortedTimeSlots.map(item => item[0]),
          title: {
            text: null
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Lecture Count',
            align: 'high'
          }
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            }
          }
        },
        series: [{
          name: 'Lectures',
          data: sortedTimeSlots.map(item => item[1]),
          color: '#EA4335'
        }],
        credits: {
          enabled: false
        }
      }
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation/>
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

  const professorChartData = prepareProfessorChartData();
  const timeSlotChartData = prepareTimeSlotChartData();

  return (
        <div className="background-main-pages">
      <Slidebar />
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-3xl font-bold text-center mb-8">Professor Teaching Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <HighchartsReact
            highcharts={Highcharts}
            options={professorChartData.chartOptions}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <HighchartsReact
            highcharts={Highcharts}
            options={timeSlotChartData.chartOptions}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Detailed Professor Statistics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Professor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Lectures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teaching Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slots
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {professors.map((professor, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {professor.professorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {professor.totalLectural}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {professor.numberDays}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="list-disc pl-5">
                      {Object.entries(professor.eachTimeSlotNo).map(([time, count]) => (
                        <li key={time}>
                          {time}: {count} lectures
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfessorAnalysis;