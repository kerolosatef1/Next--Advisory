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
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imgLOGO from "../../assets/imagelogo.jpeg";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  // داخل component الGetCourses
  const [editNameModalOpen, setEditNameModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newName, setNewName] = useState("");
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
        isEdit ? "Upload all info about Year  " : "Add Courses Successful"
      );
      resetForm();
      handleOpen();
    } catch (error) {
      setMessage(
        `❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`
      );
    }
  };
  const handleEditConfirmation = (year) => {
    setSelectedYear(year);
    setShowEditModal(true);
  };
  const handleProceedEdit = () => {
    if (!selectedYear) return;

    const yearCourses = courses.filter(
      (c) => c.year === parseInt(selectedYear)
    );
    if (yearCourses.length === 0) return;

    const sampleCourse = yearCourses[0];
    setIsEdit(true);
    setEditCourses(sampleCourse);
    setCourse({
      name: "",
      grops: sampleCourse.grops.toString(),
      grop_lap: sampleCourse.grop_lap.toString(),
      year: selectedYear.toString(),
      enrollment: sampleCourse.enrollment.toString(),
    });
    setOpen(true);
    setShowEditModal(false);
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
  const updateNameMutation = useMutation({
    mutationFn: async ({ id, newName }) => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) throw new Error("No authentication token found");

        const cachedCourses = queryClient.getQueryData(["courses"]) || [];
        const currentCourse = cachedCourses.find((c) => c.id === id);

        if (!currentCourse) {
          throw new Error("المادة غير موجودة في الذاكرة المؤقتة");
        }

        const payload = {
          name: newName,
          year: currentCourse.year,
          grops: currentCourse.grops,
          grop_lap: currentCourse.grop_lap,
          enrollment: currentCourse.enrollment,
        };

        const { data } = await axios.put(
          `https://timetableapi.runasp.net/api/Courses/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        return data;
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]); // إعادة جلب البيانات للتأكد من التحديث
      toast.success("Update Name Successfuly");
      setEditNameModalOpen(false);
      setNewName("");
      setEditingCourse(null);
    },
    onError: (error) => {
      toast.error(`❌ فشل التحديث: ${error.message}`);
    },
  });

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
      {showEditModal && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-start mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-200">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Year Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to edit settings for Year {selectedYear}
                  ?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                Confirm Edit
              </button>
            </div>
          </div>
        </div>
      )}

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
              This action cannot be undone. All data will be permanently
              removed.
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
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={editNameModalOpen} handler={setEditNameModalOpen}>
        <DialogHeader>
          Update Name Courses
          <IconButton
            variant="text"
            onClick={() => {
              setEditNameModalOpen(false);
              setNewName("");
              setEditingCourse(null);
            }}
            className="!absolute right-3 top-3"
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <Input
            label="new name course"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogBody>
        <DialogFooter>
           <Button
           // Corrected prop value
            onClick={() => {
              if (editingCourse && newName.trim()) {
                updateNameMutation.mutate({
                  id: editingCourse.id,
                  newName: newName.trim(),
                });
              }
            }}
            className="mr-2 active"
          >
           Save Update
          </Button>
        
         
        </DialogFooter>
      </Dialog>
      <div className="background-main-pages ">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
        <div className="w-full md:w-auto flex justify-between items-center order-1">
  {/* الشعار - سيظهر على جميع الشاشات */}
  <a className="flex items-center  py-4 text-lg md:text-2xl font-semibold text-white">
    <img 
      className="rounded-md w-8 h-8 mr-2" 
      src={imgLOGO} 
      alt="logo" 
    />
    NEXT Advisory
  </a>

  {/* الزر - سيظهر على جميع الشاشات */}
  <Button
    onClick={() => {
      resetForm();
      handleOpen();
    }}
    variant="gradient"
    className="color-main " // سيخفي الزر على الجوال ويظهر على الشاشات الكبيرة
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
                  className="text-left"
                >
                  {[...Array(6)].map((_, i) => {
                    const yearNumber = i + 1;
                    const hasData = !!fixedValues[yearNumber];
                    return (
                      <Option
                        className=""
                        key={yearNumber}
                        value={String(yearNumber)}
                      >
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
                          <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                            Name
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                            Groups
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                            Lab Sections
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                            Enrollment
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                            Year
                          </th>
                          <th className="px-6 py-3 text-end text-xs font-medium text-white uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-700 ">
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
                                <tr className="bg-gray-700">
                                  <td colSpan="6" className="p-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        onClick={() => {
                                          setCourse({
                                            year: String(year),
                                            ...data.fixed,
                                            name: "",
                                          });
                                          handleOpen();
                                        }}
                                        className="text-white active font-bold"
                                      >
                                        {data.fixed
                                          ? `Year ${year} +`
                                          : "إضافة سنة جديدة"}
                                      </Button>

                                      {/* زر التعديل الجديد */}
                                      <Button
                                        variant="outlined"
                                        color="blue"
                                        onClick={() =>
                                          handleEditConfirmation(year)
                                        }
                                        className="text-white hover:bg-blue-800 border-white"
                                      >
                                        Edit Year
                                      </Button>
                                    </div>
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
                                      {course.year}
                                    </td>

                                   <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
  <div className="flex gap-4 justify-end">
    <button
      onClick={() => {
        setEditingCourse(course);
        setNewName(course.name);
        setEditNameModalOpen(true);
      }}
      className="text-blue-500 hover:text-blue-800 font-semibold px-2 py-1 rounded"
    >
      Edit
    </button>
    <span className="text-gray-400">|</span>
    <button
      onClick={() => {
        setSelectedCourseId(course.id);
        setDeleteModalOpen(true);
      }}
      className="text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded"
    >
      Delete
    </button>
  </div>
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
