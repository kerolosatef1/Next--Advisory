import { useState, useEffect, Fragment } from "react";
import React from "react";
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
  Spinner,
} from "@material-tailwind/react";
import { PlusIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from "formik";
import LoadingAnimation from "../Loading/Loading";
import Slidebar from "../Slidebar/Slidebar";

const ProfessorCoursesManager = ({
  professorId,
  manageOpen,
  setManageOpen,
  selectedProfessor,
}) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const queryClient = useQueryClient();

  // جلب جميع المواد
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
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
    staleTime: 5000,
    refetchInterval: 1000,
  });

  const { data: teachingAssistantCourses = [], isLoading: assignedLoading } =
    useQuery({
      queryKey: ["teachingAssistantCourses"],
      queryFn: async () => {
        const token = localStorage.getItem("userToken");
        const { data } = await axios.get(
          "https://timetableapi.runasp.net/api/CourseTeachingAssistant",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        return data;
      },
      staleTime: 5000,
      refetchInterval: 1000,
    });
  const professorCourses = teachingAssistantCourses.filter(
    (cp) => cp.idTeachingAssistant === professorId
  );

  const assignMutation = useMutation({
    mutationFn: (courseId) =>
      axios.post(
        `https://timetableapi.runasp.net/api/CourseTeachingAssistant/${professorId}/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["teachingAssistantCourses"]);
      setSelectedCourse("");
    },
  });

  // حذف مادة
  const unassignMutation = useMutation({
    mutationFn: (courseId) =>
      axios.delete(
        `https://timetableapi.runasp.net/api/CourseTeachingAssistant/${professorId}/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      ),
    onSuccess: () =>
      queryClient.invalidateQueries(["teachingAssistantCourses"]),
  });

  return (
    <div className="p-4 mt-4 bg-gray-100 rounded-lg text-center z-10 ">
      <Dialog
        size="xl"
        open={manageOpen}
        handler={setManageOpen}
        className="rounded-lg relative "
      >
        <DialogHeader className="bg-gray-100 border-b flex justify-between items-center py-3 px-6">
          <Typography variant="h5" className="text-gray-800">
            Eng/ {selectedProfessor?.name}
          </Typography>
          <IconButton
            variant="text"
            color="gray"
            onClick={() => setManageOpen(false)}
          >
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="p-6 space-y-4">
          <div className="border rounded-lg p-4">
            <Select
              className=" text-black"
              label="اختر المادة"
              value={selectedCourse}
              onChange={(value) => setSelectedCourse(value)}
            >
              <Option value="" disabled>
                اختر من القائمة
              </Option>
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  <div className="flex items-center gap-2  text-black">
                    <span className="text-sm ">{course.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          <div className="border rounded-lg p-4">
            <Typography variant="h6" className="mb-4 text-gray-700">
              Currently Assigned Courses
            </Typography>
            <div className="space-y-3">
              {teachingAssistantCourses
                .filter((cp) => cp.idTeachingAssistant === professorId)
                ?.map((cp) => (
                  <div
                    key={cp.idCourse}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                  >
                    <span className="text-gray-700">{cp.nameCourse}</span>
                    <Button
                      variant="text"
                      color="red"
                      size="sm"
                      onClick={() => unassignMutation.mutate(cp.idCourse)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="bg-gray-50 border-t px-6 py-4">
          <Button
            fullWidth
            color="green"
            onClick={() => assignMutation.mutate(selectedCourse)}
          >
            Assigned
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

const GetTeachingAssistant = () => {
  const [editProfessor, setEditProfessor] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [professor, setProfessor] = useState({
    id: "",
    name: "",
    availability: [],
  });
  const dayMap = {
    Saturday: "sat",
    Sunday: "sun",
    Monday: "mon",
    Tuesday: "tue",
    Wednesday: "wed",
    Thursday: "thu",
    Friday: "fri",
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "id" && !/^\d*$/.test(value)) return;
    setProfessor((prev) => ({ ...prev, [name]: value }));
  };

  const { data: courseProfessors = [] } = useQuery({
    queryKey: ["teachingAssistantCourses"],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        "https://timetableapi.runasp.net/api/CourseTeachingAssistant",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
    staleTime: 5000,
    refetchInterval: 1000,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProfessor((prev) => ({
      ...prev,
      availability: checked
        ? [...prev.availability, name]
        : prev.availability.filter((day) => day !== name),
    }));
  };
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("userToken");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const url = isEdit
        ? `https://timetableapi.runasp.net/api/TeachingAssistants/${payload.id}`
        : `https://timetableapi.runasp.net/api/TeachingAssistants`;

      const method = isEdit ? axios.put : axios.post;
      const { data } = await method(url, payload, { headers });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professors"]);
      toast.success("save successful");
      handleOpen();
      resetForm();
    },
    onError: (error) => {
      toast.error(`❌ خطأ: ${error.response?.data?.message || error.message}`);
    },
  });

  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const {
    data: professors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["teachingAssistants"],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        "https://timetableapi.runasp.net/api/TeachingAssistants",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
    staleTime: 5000,
    refetchInterval: 1000,
  });

  useEffect(() => {
    const filtered = professors.filter((prof) =>
      prof.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProfessors(filtered);
  }, [search, professors]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `https://timetableapi.runasp.net/api/TeachingAssistants/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["professors"]);
      toast.success(" Delete Successful");
    },
    onError: (error) => {
      toast.error(`❌ خطأ في الحذف: ${error.response?.data?.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const daysObject = Object.keys(dayMap).reduce((acc, day) => {
      acc[dayMap[day]] = professor.availability.includes(day);
      return acc;
    }, {});
    const payload = {
      id: parseInt(professor.id, 10),
      name: professor.name.trim(),
      numberAssignedCourses: 1,
      ...daysObject,
    };

    if (isEdit) {
      payload.id = parseInt(professor.id, 10);
    }

    mutation.mutate(payload);
    if (!professor.name.trim()) {
      toast.error("يرجى إدخال اسم البروفيسور");
      return;
    }
  };
  const handleDelete = (id) => {
    if (window.confirm("Are You Sure About Delete")) {
      deleteMutation.mutate(id);
    }
  };
  const resetForm = () => {
    setProfessor({ id: "", name: "", availability: [] });
    setIsEdit(false);
    setEditProfessor(null);
  };
  const handleOpen = (professorToEdit = null) => {
    if (professorToEdit?.id) {
      const postData = {
        id: professorToEdit.id,
        name: professorToEdit.name,
        availability: Object.keys(dayMap)
          .filter((day) => professorToEdit[dayMap[day]])
          .map((day) => dayMap[day]),
      };

      console.log("PUT Data:", JSON.stringify(postData, null, 2));

      setProfessor({
        id: professorToEdit.id.toString() || "",
        name: professorToEdit.name || "",
        availability: Object.keys(dayMap).filter(
          (day) => professorToEdit[dayMap[day]]
        ),
      });
      setIsEdit(true);
    } else {
      // تحضير بيانات POST للإضافة
      console.log(
        "POST Data template:",
        JSON.stringify(
          {
            name: "",
            availability: [],
          },
          null,
          2
        )
      );

      resetForm();
    }
    setOpen(!open);
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
        Delete Professor
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
            deleteMutation.mutate(selectedProfessorId);
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

      <div className="background-main-pages ">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
          <div className="flex justify-end  ">
            <Button
              onClick={() => handleOpen()}
              variant="gradient"
              className="disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-gray-900 shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none color-main text-white flex items-center gap-2"
            >
              {isEdit ? "Modify Proffesors" : "Add Proffesor"}
            </Button>
          </div>
          <Dialog
            size="sm"
            open={open}
            handler={handleOpen}
            className="p-4 rounded-xl shadow-xl"
          >
            <DialogHeader className="relative m-0 block bg-blue-800 text-white p-4 rounded-t-xl">
              <Typography variant="h4" className="text-white">
                {isEdit
                  ? "Modify Teaching Assistant"
                  : "Add New Teaching Assistant"}
              </Typography>
              <IconButton
                size="sm"
                variant="text"
                className="!absolute right-3.5 top-3.5 text-white"
                onClick={handleOpen}
              >
                <XMarkIcon className="h-5 w-5 stroke-2" />
              </IconButton>
            </DialogHeader>

            <DialogBody className="space-y-4 pb-6 pt-6">
              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-gray-700 font-medium"
                >
                  Teaching Assistant's name
                </Typography>
                <Input
                  size="lg"
                  placeholder=""
                  required
                  className="!border-[1.5px] !border-gray-200 focus:!border-blue-800"
                  value={professor.name}
                  onChange={handleChange}
                  name="name"
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-gray-700 font-medium"
                >
                  Available Days
                </Typography>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(dayMap).map((day) => (
                    <label key={day} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-800"
                        checked={professor.availability.includes(day)}
                        onChange={handleCheckboxChange}
                        name={day}
                        required
                      />
                      <span className="text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="px-4 pb-4">
              <Button
                className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg"
                onClick={handleSubmit}
              >
                {isEdit ? "Save Modify" : "Submmit"}
              </Button>
            </DialogFooter>
          </Dialog>
          <Fragment>
            <div className="text-center">
              <input
                type="text"
                placeholder="🔍Search Teaching Assistant Name.... "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className=" mt-5  w-3/5 p-2 border rounded mb-4"
              />
            </div>
            <div className="flex flex-col ">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden ">
                    <table className="min-w-full divide-y  divide-gray-200 dark:divide-neutral-700">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium  text-white uppercase "
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Available Days
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Assigned Courses
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Number Of Assigned Courses
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
                          >
                            Action
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
                      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
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
                              colSpan="5"
                              className="text-center py-4 text-red-500"
                            >
                              {error.message}
                            </td>
                          </tr>
                        ) : filteredProfessors.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-4 text-white"
                            >
                              NOT DATA Availaible
                            </td>
                          </tr>
                        ) : (
                          filteredProfessors.map((professor) => (
                            <Fragment key={professor.id}>
                              <tr key={professor.id} className="hover:bg-black">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                  {professor.name}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {Object.entries(dayMap)
                                      .filter(([_, key]) => professor[key])
                                      .map(([day]) => (
                                        <li key={day} className="text-sm">
                                          {day}
                                        </li>
                                      ))}
                                  </ul>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-smtext-gray-700">
                                  <div className="flex flex-wrap gap-2">
                                    {courseProfessors
                                      .filter(
                                        (cp) =>
                                          cp.idTeachingAssistant ===
                                          professor.id
                                      )
                                      .map((cp) => (
                                        <span
                                          key={cp.idCourse}
                                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
                                        >
                                          {cp.nameCourse}
                                        </span>
                                      ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                  {" "}
                                  {professor.numberAssignedCourses}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                  <Button
                                    onClick={() => {
                                      setSelectedProfessor(professor);
                                      setManageOpen(true);
                                    }}
                                    variant="gradient"
                                    size="sm"
                                    className="btn-management w-full disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-gray-900 shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none color-main text-white flex items-center gap-2"
                                  >
                                    Assigned Courses
                                  </Button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                  <button
                                    type="button"
                                    onClick={() => handleOpen(professor)}
                                    className="inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent text-blue-500  hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
                                  >
                                    Edit
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-700 focus:outline-hidden focus:text-red-700 disabled:opacity-50 disabled:pointer-events-none dark:text-red-600  dark:focus:text-red-500"
                                    onClick={() => {
                                      setSelectedProfessorId(professor.id);
                                      setDeleteModalOpen(true);
                                    }}
                                  
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
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
          {/* بعد نهاية الجدول الرئيسي */}
          <Dialog
            open={manageOpen}
            handler={setManageOpen}
            size="xxl"
            className="fixed left-0 top-0 h-full w-96 rounded-r-xl shadow-xl bg-transparent "
          >
            <DialogBody className="p-96 ">
              {selectedProfessor && (
                <ProfessorCoursesManager
                  professorId={selectedProfessor.id}
                  manageOpen={manageOpen}
                  setManageOpen={setManageOpen}
                  selectedProfessor={selectedProfessor} // تمرير المتغير هنا
                />
              )}
            </DialogBody>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default GetTeachingAssistant;
