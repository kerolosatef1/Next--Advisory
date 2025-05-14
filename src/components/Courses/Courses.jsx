import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import {
  Input,
  Option,
  Select,
  Button,
  Dialog,
  Textarea,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
  ThemeProvider,
} from "@material-tailwind/react";
import { XMarkIcon,ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const GetCourses = () => {
  const [search, setSearch] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [fixedValues, setFixedValues] = useState({});
  const [editCourses, setEditCourses] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [message, setMessage] = useState("");

  const [course, setCourse] = useState({
    name: "",
    grops: "",
    grop_lap: "",
    year: "",
    enrollment: "",
  });
  const isYearOccupied = !isEdit && !!fixedValues[course.year || ""];

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setErrorMessage("❌ Token not found"); // هنا نستخدم errorMessage
        throw new Error("Token not found");
      }
      const { data } = await axios.get(
        "https://timetableapi.runasp.net/api/Courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
  });
  useEffect(() => {
    if (courses.length > 0) {
      const values = {};
      courses.forEach((course) => {
        values[course.year] = {
          enrollment: course.enrollment,
          grops: course.grops,
          grop_lap: course.grop_lap,
        };
      });
      setFixedValues(values);
    }
  }, [courses]);

  const resetForm = () => {
    setCourse({
      name: "",
      grops: "",
      grop_lap: "",
      year: "",
      enrollment: "",
    });
    setIsEdit(false);
    setEditCourses(null);
    setMessage("");
  };

  useEffect(() => {
    if (courses && courses.length > 0) {
      const yearsMap = new Map();

      courses.forEach((course) => {
        if (!yearsMap.has(course.year)) {
          yearsMap.set(course.year, {
            enrollment: course.enrollment,
            grops: course.grops,
            grop_lap: course.grop_lap,
          });
        }
      });

      setFixedValues(Object.fromEntries(yearsMap));
    }
  }, [courses]); // تحديث القيم عند تغيير بيانات الكورسات

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["grops", "grop_lap", "year", "enrollment"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }

    setCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // استبدال دالة handleSubmit القديمة بهذا الكود
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("userToken");
      const url = isEdit
        ? `https://timetableapi.runasp.net/api/Courses/${editCourses.id}`
        : "https://timetableapi.runasp.net/api/Courses";

      const method = isEdit ? axios.put : axios.post;

      const { data } = await method(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("save successful");
      resetForm();
      handleOpen();
    },
    onError: (error) => {
      setMessage(
        `❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`
      );
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("userToken");
      const payload = {
        grops: parseInt(course.grops, 10),
        grop_lap: parseInt(course.grop_lap, 10),
        enrollment: parseInt(course.enrollment, 10),
        year: parseInt(course.year, 10),
      };

      if (isEdit) {
        // 1. الحصول على جميع المواد في السنة المختارة
        const originalYear = editCourses.year;
        const coursesToUpdate = courses.filter((c) => c.year === originalYear);

        // 2. تحديث كل مادة في السنة
        await Promise.all(
          coursesToUpdate.map(async (c) => {
            await axios.put(
              `https://timetableapi.runasp.net/api/Courses/${c.id}`,
              {
                ...c,
                ...payload,
                name: c.name, // الحفاظ على الاسم الأصلي
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          })
        );

        // 3. إذا تم تغيير السنة، ننقل المواد للسنة الجديدة
        if (payload.year !== originalYear) {
          // حذف الإعدادات القديمة
          setFixedValues((prev) => {
            const newValues = { ...prev };
            delete newValues[originalYear];
            return newValues;
          });

          // إضافة إعدادات السنة الجديدة
          setFixedValues((prev) => ({
            ...prev,
            [payload.year]: {
              grops: payload.grops,
              grop_lap: payload.grop_lap,
              enrollment: payload.enrollment,
            },
          }));
        }
      } else {
        // كود الإضافة الأصلي
        if (!fixedValues[course.year]) {
          setFixedValues((prev) => ({
            ...prev,
            [course.year]: {
              grops: payload.grops,
              grop_lap: payload.grop_lap,
              enrollment: payload.enrollment,
            },
          }));
        }

        await axios.post(
          "https://timetableapi.runasp.net/api/Courses",
          { ...payload, name: course.name.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await queryClient.invalidateQueries(["courses"]);
      toast.success(
        isEdit ? "تم تحديث كل المواد في السنة بنجاح" : "تمت الإضافة بنجاح"
      );
      resetForm();
      handleOpen();
    } catch (error) {
      setMessage(
        `❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`
      );
    }
  };

  const handleOpen = () => {
    if (!open) {
      if (isEdit) {
        setCourse({
          ...editCourses,
          year: editCourses.year.toString(),
          grops: editCourses.grops.toString(),
          grop_lap: editCourses.grop_lap.toString(),
          enrollment: editCourses.enrollment.toString(),
        });
      } else {
        setCourse((prev) => ({
          ...prev,
          year: prev.year || "", // إضافة قيمة افتراضية
          enrollment: fixedValues[prev.year]?.enrollment || "",
          grops: fixedValues[prev.year]?.grops || "",
          grop_lap: fixedValues[prev.year]?.grop_lap || "",
        }));
      }
    }
    setOpen(!open);
  };

  // استبدال useEffect القديم بهذا الكود

  const filteredCourses =
    courses?.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("userToken");
      await axios.delete(`https://timetableapi.runasp.net/api/Courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast.success("Delete Successful");
    },
    onError: (error) => {
      setMessage(`❌ Failed on delete: ${error.response?.data?.message}`);
    },
  });

  

  const handleEdit = (course) => {
    if (
      window.confirm(`هل تريد تعديل إعدادات السنة ${course.year} لجميع المواد؟`)
    ) {
      setIsEdit(true);
      setEditCourses(course);
      const fixed = fixedValues[course.year] || {};
      setCourse({
        name: "",
        grops: fixed.grops?.toString() || "",
        grop_lap: fixed.grop_lap?.toString() || "",
        year: course.year.toString(),
        enrollment: fixed.enrollment?.toString() || "",
      });
      setOpen(true);
    }
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
        <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
      <DialogHeader>
        Delete Course
        <IconButton
          variant="text"
          onClick={() => setDeleteModalOpen(false)}
          className="!absolute right-3 top-3"
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col items-center gap-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-600" />
          <Typography variant="h5" color="red">
            Are you sure?
          </Typography>
          <Typography>
            This action cannot be undone. All data will be permanently removed.
          </Typography>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          color="red"
          onClick={() => {
            deleteMutation.mutate(selectedCourseId);
            setDeleteModalOpen(false);
          }}
          className="mr-2"
        >
          Delete
        </Button>
        <Button
          
          onClick={() => setDeleteModalOpen(false)}
        >
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
      {(isLoading || mutation.isPending || deleteMutation.isPending) && (
        <LoadingAnimation />
      )}

      <div className="background-main-pages ">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
          <div className="flex justify-end  ">
            <Button
              onClick={() => {
                resetForm();
                handleOpen();
              }}
              variant="gradient"
              className="color-main"
            >
              Add Courses
            </Button>
          </div>
          <Dialog size="sm" open={open} handler={handleOpen} className="p-4">
            <DialogHeader className="relative m-0 block bg-blue-800 text-white p-4 rounded-t-xl">
              <Typography variant="h4" color="blue-gray">
                {isEdit ? "Edit Course" : "Add New Course"}
              </Typography>
              <IconButton
                size="sm"
                variant="text"
                className="!absolute right-3.5 top-3.5"
                onClick={() => {
                  resetForm();
                  handleOpen();
                }}
              >
                <XMarkIcon className="h-4 w-4 stroke-2" />
              </IconButton>
            </DialogHeader>
            <DialogBody className="space-y-4 pb-6">
              {!isEdit && (
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 text-left font-medium"
                  >
                    Name Course
                  </Typography>
                  <Input
                    color="gray"
                    size="lg"
                    required
                    placeholder="Math1..."
                    name="name"
                    value={course.name}
                    onChange={handleChange}
                    className="placeholder:opacity-100 focus:!border-t-gray-900"
                    containerProps={{ className: "!min-w-full" }}
                    labelProps={{ className: "hidden" }}
                  />
                </div>
              )}

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 text-left font-medium"
                >
                  Number of groups (normal)
                </Typography>
                <Input
                  color="gray"
                  size="lg"
                  required
                  name="grops"
                  value={
                    isEdit
                      ? course.grops
                      : isYearOccupied
                      ? fixedValues[course.year]?.grops
                      : course.grops
                  }
                  onChange={handleChange}
                  placeholder="EX: 4"
                  disabled={isYearOccupied}
                  className="placeholder:opacity-100 focus:!border-t-gray-900"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 text-left font-medium"
                >
                  Number of groups sections
                </Typography>
                <Input
                  color="gray"
                  size="lg"
                  name="grop_lap"
                  required
                  value={
                    isEdit
                      ? course.grop_lap
                      : isYearOccupied
                      ? fixedValues[course.year]?.grop_lap
                      : course.grop_lap
                  }
                  onChange={handleChange}
                  placeholder="EX: 3"
                  disabled={isYearOccupied}
                  className="placeholder:opacity-100 focus:!border-t-gray-900"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 text-left font-medium"
                >
                  Enrollment
                </Typography>
                <Input
                  color="gray"
                  size="lg"
                  required
                  name="enrollment"
                  value={
                    isEdit
                      ? course.enrollment
                      : isYearOccupied
                      ? fixedValues[course.year]?.enrollment
                      : course.enrollment
                  }
                  onChange={handleChange}
                  placeholder="EX: 100"
                  disabled={isYearOccupied}
                  containerProps={{ className: "!min-w-full" }}
                  className="placeholder:opacity-100 focus:!border-t-gray-900"
                  labelProps={{ className: "hidden" }}
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 text-left font-medium"
                >
                  Year
                </Typography>
                <Select
                  value={course.year}
                  onChange={(selectedYear) => {
                    const fixed = fixedValues[selectedYear];
                    setCourse((prev) => ({
                      ...prev,
                      year: selectedYear,
                      ...(!isEdit && fixed
                        ? {
                            enrollment: fixed.enrollment.toString(),
                            grops: fixed.grops.toString(),
                            grop_lap: fixed.grop_lap.toString(),
                          }
                        : {}),
                    }));
                  }}
                  disabled={isEdit}
                  className="text-right"
                >
                  {[...Array(6)].map((_, i) => {
                    const yearNumber = i + 1;
                    const hasData = !!fixedValues[yearNumber];
                    return (
                      <Option key={yearNumber} value={String(yearNumber)}>
                        {hasData ? `Year ${yearNumber}` : `New Year`}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                className="ml-auto active"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "SAVING...." : "Submmit"}
              </Button>
            </DialogFooter>
          </Dialog>
          <Fragment>
            <div className="text-center">
              <input
                type="text"
                placeholder="🔍 Search Courses Name "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className=" mt-5  w-3/5 p-2 border rounded mb-4"
              />
            </div>
            <div className="flex flex-col ">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden ">
                    <table className="min-w-full divide-y  divide-gray-200 ">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium  text-white uppercase"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase"
                          >
                            Groups
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Lab Sections
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Enrollment
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Year
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-xs font-medium text-white uppercase "
                          >
                            Action
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-xs font-medium text-white uppercase "
                          >
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y ">
                        {isLoading ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center py-4 text-white"
                            >
                              <LoadingAnimation />
                            </td>
                          </tr>
                        ) : isError ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center py-4 text-red-500"
                            >
                              {error.message}
                            </td>
                          </tr>
                        ) : filteredCourses.length === 0 ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center py-4 text-white"
                            >
                              Not Available Data
                            </td>
                          </tr>
                        ) : (
                          Object.entries(
                            filteredCourses.reduce((acc, course) => {
                              const year = course.year;
                              if (!acc[year]) {
                                acc[year] = {
                                  courses: [],
                                  fixed: fixedValues[year] || {},
                                };
                              }
                              acc[year].courses.push(course);
                              return acc;
                            }, {})
                          )
                            .sort(([a], [b]) => a - b)
                            .map(([year, data]) => (
                              <Fragment key={year}>
                                <tr className="bg-blue-800">
                                  <td colSpan="7" className="p-2 text-center">
                                    <button
                                      onClick={() => {
                                        setCourse({
                                          year: String(year),
                                          ...data.fixed,
                                          name: "",
                                        });
                                        handleOpen();
                                      }}
                                      className="text-white font-bold"
                                    >
                                      {data.fixed
                                        ? `السنة ${year} +`
                                        : "إضافة سنة جديدة"}
                                    </button>
                                  </td>
                                </tr>

                                {/* الكورسات الخاصة بهذه السنة */}
                                {data.courses.map((course) => (
                                  <tr
                                    key={course.id}
                                    className="hover:bg-black"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white ">
                                      {course.name}
                                      <button
                                        onClick={() => handleEditCourse(course)}
                                        className="ml-2 text-blue-400 hover:text-blue-600"
                                      >
                                        Edit
                                      </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white ">
                                      {course.grops}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white ">
                                      {course.grop_lap}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white ">
                                      {course.enrollment}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white ">
                                      السنة {course.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                      <button
                                        onClick={() => handleEdit(course)}
                                      >
                                        Edit
                                      </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                      <button
                                        onClick={() => {
                                          setSelectedCourseId(course.id);
                                          setDeleteModalOpen(true);
                                        }}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </Fragment>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        </div>
      </div>
    </>
  );
};

export default GetCourses;
