import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingAnimation from '../Loading/Loading';
import Slidebar from '../Slidebar/Slidebar';

const TimeAnalysisDashboard = () => {
    const [daysData, setDaysData] = useState([]);
    const [timeSlotsData, setTimeSlotsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Map day numbers to names
    const dayNames = {
        1: 'Saturday',
        2: 'Sunday',
        3: 'Monday',
        4: 'Tuesday',
        5: 'Wednesday',
        6: 'Thursday',
        7: 'Friday'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem("userToken");
                if (!token) {
                    throw new Error("Authentication required. Please login.");
                }

                // Fetch both data in parallel with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const [daysResponse, timeSlotsResponse] = await Promise.all([
                    axios.get("https://timetableapi.runasp.net/api/AnalysisAndStatisticals/TotalDays", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        signal: controller.signal
                    }),
                    axios.get("https://timetableapi.runasp.net/api/AnalysisAndStatisticals/TotalTimeSlot", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        signal: controller.signal
                    })
                ]);

                clearTimeout(timeoutId);

                // Process days data - include all days with 0 for missing ones
                const completeDaysData = Array.from({ length: 7 }, (_, i) => ({
                    name: dayNames[i + 1],
                    y: daysResponse.data[i + 1] || 0,
                    dayNumber: i + 1
                }));

                // Process time slots data and sort by time
                const timeSlotsArray = Object.entries(timeSlotsResponse.data)
                    .map(([name, y]) => ({ name, y }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setDaysData(completeDaysData);
                setTimeSlotsData(timeSlotsArray);
            } catch (err) {
                const errorMsg = axios.isCancel(err) 
                    ? "Request timed out" 
                    : err.response?.data?.message || err.message;
                setError(errorMsg);
                toast.error(`Failed to load data: ${errorMsg}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const commonChartOptions = {
        chart: {
            type: 'pie',
            zooming: { type: 'xy' },
            panning: { enabled: true, type: 'xy' },
            panKey: 'shift',
            backgroundColor: 'transparent',
            height: '450px'
        },
        title: {
            style: { 
                color: '#2d3748',
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: 'inherit'
            }
        },
        tooltip: {
            formatter: function() {
                return `<b>${this.point.name}</b><br/>
                        Sections: <b>${this.point.y}</b><br/>
                        Percentage: <b>${this.point.percentage.toFixed(1)}%</b>`;
            },
            useHTML: true
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true,
                borderWidth: 1,
                borderColor: '#fff',
                dataLabels: [{
                    enabled: true,
                    distance: 20,
                    style: {
                        fontWeight: '500',
                        textOutline: 'none'
                    }
                }, {
                    enabled: true,
                    distance: -40,
                    format: '{point.percentage:.1f}%',
                    style: {
                        fontSize: '1.1em',
                        textOutline: 'none',
                        opacity: 0.9
                    },
                    filter: {
                        property: 'percentage',
                        operator: '>',
                        value: 5
                    }
                }],
                point: {
                    events: {
                        mouseOver: function() {
                            this.slice();
                        },
                        mouseOut: function() {
                            this.slice(false);
                        }
                    }
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemStyle: {
                fontSize: '13px',
                fontWeight: 'normal'
            }
        },
        credits: { enabled: false }
    };

    const daysChartOptions = {
        ...commonChartOptions,
        title: { ...commonChartOptions.title, text: 'Distribution by Day of Week' },
        subtitle: { text: 'Total sections scheduled per day' },
        series: [{
            ...commonChartOptions.series,
            name: 'Sections',
            colorByPoint: true,
            data: daysData,
            size: '100%'
        }]
    };

    const timeSlotsChartOptions = {
        ...commonChartOptions,
        title: { ...commonChartOptions.title, text: 'Distribution by Time Slot' },
        subtitle: { text: 'Total sections scheduled per time slot' },
        series: [{
            ...commonChartOptions.series,
            name: 'Sections',
            colorByPoint: true,
            data: timeSlotsData,
            size: '100%'
        }]
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-blue-200 h-12 w-12"></div>
                </div>
                <LoadingAnimation/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
      <div className="background-main-pages">
      <Slidebar />
      
        <div className="min-h-screen p-4 md:p-8">
            <ToastContainer position="top-right" autoClose={5000} />
            
            <header className="mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Time Distribution Analysis
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Visual representation of sections distribution across days and time slots
                </p>
            </header>
            
            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={daysChartOptions}
                            containerProps={{ style: { width: '100%' } }}
                        />
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={timeSlotsChartOptions}
                            containerProps={{ style: { width: '100%' } }}
                        />
                    </div>
                </div>
                
                {/* Days of Week Section */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
                        Days of Week Statistics
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {daysData.map((day) => (
                            <div 
                                key={day.dayNumber} 
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"
                            >
                                <h3 className="font-bold text-gray-700">{day.name}</h3>
                                <p className="text-gray-600 mt-2">Sections: <span className="font-bold">{day.y}</span></p>
                                <p className="text-gray-600">
                                    {((day.y / daysData.reduce((sum, d) => sum + d.y, 0)) * 100 || 0).toFixed(1)}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Time Slots Section */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">
                        Time Slots Statistics
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {timeSlotsData.map((slot, index) => (
                            <div 
                                key={index} 
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"
                            >
                                <h3 className="font-bold text-gray-700">{slot.name}</h3>
                                <p className="text-gray-600 mt-2">Sections: <span className="font-bold">{slot.y}</span></p>
                                <p className="text-gray-600">
                                    {((slot.y / timeSlotsData.reduce((sum, t) => sum + t.y, 0)) * 100 || 0).toFixed(1)}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
      </div>
    );
};

export default TimeAnalysisDashboard;