import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Checkbox,
  Input,
  Typography,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
} from "@material-tailwind/react";
import { useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import "react-toastify/dist/ReactToastify.css";
import Slidebar from "../Slidebar/Slidebar";

const GenerateSchedule = () => {
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState(() => {
    const saved = localStorage.getItem("generateSchedule_selectedDays");
    return saved ? JSON.parse(saved) : [];
  });
  const [timeslots, setTimeslots] = useState(() => {
    const saved = localStorage.getItem("generateSchedule_timeslots");
    return saved ? JSON.parse(saved) : [""];
  });

  const [run_capacity, setRunCapacity] = useState(() => {
    const saved = localStorage.getItem("generateSchedule_run_capacity");
    return saved ? JSON.parse(saved) : false;
  });
  useEffect(() => {
    localStorage.setItem(
      "generateSchedule_selectedDays",
      JSON.stringify(selectedDays)
    );
  }, [selectedDays]);

  useEffect(() => {
    localStorage.setItem(
      "generateSchedule_timeslots",
      JSON.stringify(timeslots)
    );
  }, [timeslots]);

  useEffect(() => {
    localStorage.setItem(
      "generateSchedule_run_capacity",
      JSON.stringify(run_capacity)
    );
  }, [run_capacity]);

  // أيام الأسبوع كـ strings
  const daysOfWeek = [
    { id: "1", name: "Saturday" },
    { id: "2", name: "Sunday" },
    { id: "3", name: "Monday" },
    { id: "4", name: "Tuesday" },
    { id: "5", name: "Wednesday" },
    { id: "6", name: "Thursday" },
    { id: "7", name: "Friday" },
  ];

  // قبول تنسيقات مرنة للوقت
  const isValidTimeslot = (time) => {
    const regex = /^(\d{1,2}:\d{1,2})-(\d{1,2}:\d{1,2})$/;
    return regex.test(time);
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("يرجى تسجيل الدخول أولاً");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.post(
          "https://timetableapi.runasp.net/api/schedule/generate",
          {
            days: formData.days,
            timeslots: formData.timeslots,
            run_capacity: formData.run_capacity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message ||
            "Talk to Andrew to open the algorithm server 😂😂😂"
        );
      }
    },
    onSuccess: () => {
      toast.success("Done, Successful Create TimeTable");
      navigate("/timetable");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Problem on resourses ,Please Try Again");
    },
  });

  // إدارة اختيار الأيام
  const handleDayCheck = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  // إدارة الأوقات
  const addTimeslot = () => {
    if (timeslots.length < 10) {
      setTimeslots([...timeslots, ""]);
    }
  };

  const updateTimeslot = (index, value) => {
    const newTimeslots = [...timeslots];
    newTimeslots[index] = value;
    setTimeslots(newTimeslots);
  };

  const removeTimeslot = (index) => {
    const newTimeslots = timeslots.filter((_, i) => i !== index);
    setTimeslots(newTimeslots);
  };

  const validateForm = () => {
    const errors = [];
    const validTimeslots = timeslots.filter((t) => t.trim() !== "");

    if (selectedDays.length === 0)
      errors.push("Please select at least one day.");
    if (validTimeslots.length === 0)
      errors.push("Please select at least one time.");

    validTimeslots.forEach((t) => {
      if (!isValidTimeslot(t)) errors.push(`Incorrect time format: ${t}`);
    });

    return [...new Set(errors)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      errors.forEach((err) => toast.warn(` ${err}`));
      return;
    }

    mutate({
      days: selectedDays,
      timeslots: timeslots.filter((t) => t.trim() !== ""),
      run_capacity,
    });
  };

  // Modified reset function
  const resetForm = () => {
    setSelectedDays([]);
    setTimeslots([""]);
    setRunCapacity(false);
    // Clear localStorage
    localStorage.removeItem("generateSchedule_selectedDays");
    localStorage.removeItem("generateSchedule_timeslots");
    localStorage.removeItem("generateSchedule_run_capacity");
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="background-main-pages ">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md   ">
          <Card className="shadow-xl ">
            <CardHeader floated={false} className="bg-blue-800 text-white p-4">
              <Typography  className=" text-center text-xl md:text-3xl font-bold">
                Generate a Schedule
              </Typography>
            </CardHeader>

            <CardBody className="p-6 ">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Typography
                      variant="h6"
                      className=" font-bold text-gray-700"
                    >
                      University study days
                    </Typography>
                    <Tooltip content="Select the days you want to include in the schedule">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {daysOfWeek.map((day) => (
                      <label
                        key={day.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <Checkbox
                          color="blue"
                          checked={selectedDays.includes(day.id)}
                          onChange={() => handleDayCheck(day.id)}
                        />
                        <span className="text-gray-700">{day.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Typography variant="h6" className="text-gray-700">
                      times:
                    </Typography>
                    <Tooltip content="Time format: start-end (example: 09:00-11:00)">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                    </Tooltip>
                  </div>
                  {timeslots.map((timeslot, index) => (
                    <div key={index} className="mb-4 relative">
                      <div className="flex gap-2">
                        <Input
                          placeholder="09:00-11:00"
                          value={timeslot}
                          onChange={(e) =>
                            updateTimeslot(index, e.target.value)
                          }
                          className={`flex-1 dir-ltr text-center ${
                            !isValidTimeslot(timeslot) && timeslot !== ""
                              ? "!border-red-500"
                              : ""
                          }`}
                        />
                        {timeslots.length > 1 && (
                          <Button
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => removeTimeslot(index)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      {!isValidTimeslot(timeslot) && timeslot !== "" && (
                        <span className="absolute text-red-500 text-xs mt-1">
                          تنسيق الوقت غير صحيح
                        </span>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outlined"
                    color="blue"
                    size="sm"
                    onClick={addTimeslot}
                    className="mt-2"
                    disabled={timeslots.length >= 10}
                  >
                    + Add time (max 10)
                  </Button>
                </div>

                {/* الالتزام بقدرة القاعات */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={run_capacity}
                    onChange={(e) => setRunCapacity(e.target.checked)}
                    color="blue"
                  />
                  <Typography className="text-gray-700 font-bold">
                    Commitment to hall capacity
                  </Typography>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  color=""
                  disabled={isLoading}
                  className="mt-4 active"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      جاري المعالجة...
                    </div>
                  ) : (
                    "Schedule"
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
};

export default GenerateSchedule;
