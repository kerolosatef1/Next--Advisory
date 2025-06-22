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

// Custom pie animation
(function (H) {
  H.seriesTypes.pie.prototype.animate = function (init) {
    const series = this,
      chart = series.chart,
      points = series.points,
      { animation } = series.options,
      { startAngleRad } = series;

    function fanAnimate(point, startAngleRad) {
      const graphic = point.graphic,
        args = point.shapeArgs;

      if (graphic && args) {
        graphic
          .attr({
            start: startAngleRad,
            end: startAngleRad,
            opacity: 1,
          })
          .animate(
            {
              start: args.start,
              end: args.end,
            },
            {
              duration: animation.duration / points.length,
            },
            function () {
              if (points[point.index + 1]) {
                fanAnimate(points[point.index + 1], args.end);
              }
              if (point.index === series.points.length - 1) {
                series.dataLabelsGroup.animate(
                  {
                    opacity: 1,
                  },
                  void 0,
                  function () {
                    points.forEach((point) => {
                      point.opacity = 1;
                    });
                    series.update(
                      {
                        enableMouseTracking: true,
                      },
                      false
                    );
                    chart.update({
                      plotOptions: {
                        pie: {
                          innerSize: "40%",
                          borderRadius: 8,
                        },
                      },
                    });
                  }
                );
              }
            }
          );
      }
    }

    if (init) {
      points.forEach((point) => {
        point.opacity = 0;
      });
    } else {
      fanAnimate(points[0], startAngleRad);
    }
  };
})(Highcharts);

const ClassroomAnalysis = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "https://timetableapi.runasp.net/api/AnalysisAndStatisticals/LectureClassRoom",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setClassrooms(response.data);
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
    const data = classrooms.map((classroom) => ({
      name: classroom.classRoomName,
      y: classroom.totalAssigned,
      timeSlots: classroom.eachTimeSlot,
    }));

    return {
      chartOptions: {
        chart: {
            type: "pie",
            backgroundColor: "transparent",
        height:700,
        },
        title: {
          text: "Hall Utilization",
          style: {
            fontSize: "24px",
            color: "#333",
          },
        },
        subtitle: {
          text: "Distribution of lectures across classrooms",
          style: {
            color: "#666",
          },
        },
        tooltip: {
          headerFormat: "",
          pointFormat:
            '<span style="color:{point.color}">\u25cf</span> ' +
            "<b>{point.name}</b><br>" +
            "Total Lectures: <b>{point.y}</b><br>" +
            "<br>Time Slots:<br>" +
            "{#each point.timeSlots}" +
            "{key}: <b>{value}</b><br>" +
            "{/each}",
          useHTML: true,
          formatter: function () {
            let timeSlotsText = "";
            for (const [time, count] of Object.entries(this.point.timeSlots)) {
              timeSlotsText += `${time}: <b>${count}</b><br>`;
            }
            return (
              `<span style="color:${this.point.color}">\u25cf</span> <b>${this.point.name}</b><br>` +
              `Total Lectures: <b>${this.point.y}</b><br><br>` +
              `Time Slots:<br>${timeSlotsText}`
            );
          },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            borderWidth: 2,
            cursor: "pointer",
            size:'90%',
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b><br>{point.y} lectures",
              distance: 20,
              style: {
                fontSize: "14px",
              },
            },
            showInLegend: true,
            animation: {
              duration: 2000,
            },
          },
        },
        series: [
          {
            enableMouseTracking: false,
            colorByPoint: true,
            data: data,
          },
        ],
        credits: {
          enabled: false,
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      distance: 10,
                      style: {
                        fontSize: "10px",
                      },
                    },
                  },
                },
              },
            },
          ],
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
          Lecture Hall Analysis
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <HighchartsReact
            highcharts={Highcharts}
            options={chartData.chartOptions}
          />
        </div>

       
      </div>
    </div>
  );
};

export default ClassroomAnalysis;
