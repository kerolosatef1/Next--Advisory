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
}from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GetCourses = () => {
  const [editCourses, setEditCourses] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  
  const [course, setCourse] = useState({
    name: "",
    grops: "",      
    grop_lap: "", 
    year: "",
    enrollment: ""
  });
  const resetForm = () => {
    setCourse({ 
      name: "", 
      grops: "", 
      grop_lap: "", 
      year: "", 
      enrollment: "" 
    });
    setIsEdit(false);
    setEditCourses(null);
    setMessage("");
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
  
    if (["grops", "grop_lap", "year","enrollment"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
    }
  
    setCourse((prev) => ({
      ...prev,
      [name]: value
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
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['courses']);
    toast.success("save successful");
    resetForm();
    handleOpen();
  },
  onError: (error) => {
    setMessage(`❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`);
  }
});

const handleSubmit = (e) => {
  e.preventDefault();
  const payload = {
    name: course.name.trim(),
    grops: parseInt(course.grops, 10),
    grop_lap: parseInt(course.grop_lap, 10),
    year: parseInt(course.year, 10),
    enrollment: parseInt(course.enrollment, 10)
  };
  mutation.mutate(payload);
};
  


  const [search, setSearch] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
    if (!open) { 
      if (!isEdit) { 
        resetForm(); 
      }
    }
  };

// استبدال useEffect القديم بهذا الكود
const { data: courses = [], isLoading, isError, error } = useQuery({
  queryKey: ['courses'],
  queryFn: async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setErrorMessage("❌ Token not found"); // هنا نستخدم errorMessage
      throw new Error('Token not found');
    }
    const { data } = await axios.get(
      "https://timetableapi.runasp.net/api/Courses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return data;
  }
});



const filteredCourses = courses?.filter(c => 
  c.name?.toLowerCase().includes(search.toLowerCase())
) || []; 

const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const token = localStorage.getItem("userToken");
    await axios.delete(
      `https://timetableapi.runasp.net/api/Courses/${id}`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['courses']);
    toast.success("Delete Successful");
  },
  onError: (error) => {
    setMessage(`❌ Failed on delete: ${error.response?.data?.message}`);
  }
});

const handleDelete = (id) => {
  if (window.confirm("Are You Sure About Delete")) {
    deleteMutation.mutate(id);
  }
};
 

  return <>
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
    {(isLoading || mutation.isPending || deleteMutation.isPending) && (
      <LoadingAnimation />
    )}
   
   <div className="background-main-pages ">
    <Slidebar/>
    <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
    
    <div className="flex justify-end  ">
  <Button  onClick={() => {
                resetForm(); 
                handleOpen();
              }} variant="gradient" className="color-main">
    Add Courses
  </Button>
</div>
      <Dialog size="sm"  open={open} handler={handleOpen} className="p-4">
        <DialogHeader  className="relative m-0 block bg-blue-800 text-white p-4 rounded-t-xl">
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
              containerProps={{
                className: "!min-w-full",
              }}
              labelProps={{
                className: "hidden",
              }}
            />
          </div>
          <div>
  <Typography variant="small" color="blue-gray" className="mb-2 text-left font-medium">
    Number of groups (normal)
  </Typography>
  <Input
    color="gray"
    size="lg"
    required
    name="grops"
    value={course.grops}
    onChange={handleChange}
    placeholder="EX: 4"
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
              Number of groups sections
            </Typography>
            <Input
              color="gray"
              size="lg"
              name="grop_lap"
              required
              value={course.grop_lap}
              onChange={handleChange}
              placeholder="EX: 3"
              containerProps={{ className: "!min-w-full" }}
              
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
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
      value={course.enrollment}
      onChange={handleChange}
      placeholder="EX: 100"
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
              year
            </Typography>
            <Select
  color="gray"
  size="lg"
  name="year"
  value={course.year}
  onChange={(val) => handleChange({ target: { name: "year", value: val } })}
  placeholder="EX: 1"
  containerProps={{ className: "!min-w-full" }}
  className="placeholder:opacity-100 focus:!border-t-gray-900"
  labelProps={{ className: "hidden" }}
>
  {[...Array(6)].map((_, i) => (
    <Option key={i + 1} value={String(i + 1)}>
      {i + 1}
    </Option>
  ))}
</Select>

            
          </div>
          
          
        </DialogBody>
        <DialogFooter>
          <Button
  className="ml-auto text-black"
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
      /></div>
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
                    <th scope="col"className="px-6 py-3 text-start text-xs font-medium text-white uppercase "
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
              <td colSpan="7" className="text-center py-4 text-white">
                <LoadingAnimation/>
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-red-500">
                {error.message}
              </td>
            </tr>
          ) : filteredCourses.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-white">
                Not Available Data
              </td>
            </tr>
          ) : (
            Object.entries(
              filteredCourses.reduce((acc, course) => {
                const year = course.year;
                if (!acc[year]) acc[year] = [];
                acc[year].push(course);
                return acc;
              }, {})
            )
            .sort(([a], [b]) => a - b)
            .map(([year, courses]) => (
              <Fragment key={year}>
                {/* عنوان السنة */}
                <tr className="bg-blue-gray-50/50">
                  <td colSpan="7" className="px-6 py-3 font-bold text-center text-lg color-txttt  dark:text-white">
                    Year {year}
                  </td>
                </tr>

                {/* الكورسات الخاصة بهذه السنة */}
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-black">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-white">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-white">
                      {course.grops}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-white">
                      {course.grop_lap}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-white">
                      {course.enrollment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-white">
                      {course.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <button
                        onClick={() => {
                          setIsEdit(true);
                          setEditCourses(course);
                          setCourse({
                            name: course.name,
                            grops: course.grops.toString(),
                            grop_lap: course.grop_lap.toString(),
                            year: course.year.toString(),
                            enrollment: course.enrollment.toString()
                          });
                          setOpen(true); // هذه السطر هو الأهم لإظهار النموذج
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <button
                        onClick={() => handleDelete(course.id)}
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
};
XMarkIcon
export default GetCourses;
