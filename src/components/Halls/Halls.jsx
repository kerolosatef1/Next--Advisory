import { useState, Fragment } from "react";
import axios from "axios";
import imgLOGO from '../../assets/imagelogo.jpeg'
import {
  Input,
  Option,
  Select,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
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
// أضف هذا الاستيراد مع بقية الاستيرادا
const GetHalls = () => {
  const queryClient = useQueryClient();
  const [editHall, setEditHall] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState(null);

  // داخل مكون GetHals أضف هذه الدالة
  const DeleteConfirmationModal = () => (
    <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
      <DialogHeader>
        Delete Hall
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
            deleteMutation.mutate(selectedHallId);
            setDeleteModalOpen(false);
          }}
          className="mr-2"
        >
          Delete
        </Button>
        <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
      </DialogFooter>
    </Dialog>
  );
  const [hall, setHall] = useState({
    name: "",
    type: false,
    capacity: "",
  });

  const resetForm = () => {
    setHall({ name: "", type: false, capacity: "" });
    setIsEdit(false);
    setEditHall(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHall((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const {
    data: halls = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["halls"],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        "https://timetableapi.runasp.net/api/ClassRooms",
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

  // طلب الإضافة/التعديل
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("userToken");
      const url = isEdit
        ? `https://timetableapi.runasp.net/api/ClassRooms/${editHall.id}`
        : "https://timetableapi.runasp.net/api/ClassRooms";

      const method = isEdit ? axios.put : axios.post;

      const { data } = await method(
        url,
        {
          ...payload,
          userGuid: localStorage.getItem("userGuid"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["halls"]);
      toast.success(isEdit ? "Update Halls Successfull" : "Save Successfully");
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        `❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`
      );
    },
  });
  // طلب الحذف
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `https://timetableapi.runasp.net/api/ClassRooms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["halls"]);
      toast.success("Delete Successfully");
    },
    onError: (error) => {
      toast.error(`❌ خطأ في الحذف: ${error.response?.data?.message}`);
    },
  });
  // معالجة الإرسال
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !hall.name.trim() ||
      !hall.capacity ||
      isNaN(hall.capacity) ||
      parseInt(hall.capacity) <= 0
    ) {
      return;
    }
    const payload = {
      ...hall,
      capacity: parseInt(hall.capacity, 10),
    };
    mutation.mutate(payload);
  };

  // فتح نموذج التعديل
  const handleEdit = (hallToEdit) => {
    setEditHall(hallToEdit);
    setHall({
      name: hallToEdit.name,
      type: hallToEdit.type,
      capacity: hallToEdit.capacity.toString(),
    });
    setIsEdit(true);
    setOpen(true);
  };

  // تصفية النتائج
  const filteredHalls = halls
    .filter((h) => h.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.type - b.type);
  const lectureHalls = filteredHalls.filter((hall) => !hall.type);
  const sectionHalls = filteredHalls.filter((hall) => hall.type);
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
      <DeleteConfirmationModal />
      {(isLoading || mutation.isPending || deleteMutation.isPending) && (
        <LoadingAnimation />
      )}
      <div className="background-main-pages ">
        <Slidebar />
        <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
          {/* التعديل على جزء البحث والزر */}
        {/* التعديل على جزء البحث والزر */}
<div className="flex flex-col  md:flex-row items-center justify-between mb-6 p-4 gap-4">
  <div className="w-full md:w-auto flex justify-between items-center order-1">
    <a  className="flex items-center text-2xl font-semibold text-white">
                    <img className="rounded-md w-8 h-8 mr-2" src={imgLOGO} alt="logo"/>
                    NEXT Advisory
                  </a>

    {/* زر الإضافة على اليمين (للجوال فقط) */}
    <div className="md:hidden  order-2">
      <Button 
        onClick={() => {
          setOpen(true);
          resetForm(); 
        }} 
        className="text-xs py-2 px-4 rounded-lg active text-white"
      >
        Add Hall
      </Button>
    </div>
  </div>

  {/* حقل البحث (للجوال يأخذ كامل العرض) */}
  <div className="w-full md:flex-1 md:mx-4 order-last md:order-3">
    <input
      type="text"
      placeholder="🔍 Search By Hall Name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full p-2 border rounded bg-white text-gray-800"
    />
  </div>

  {/* زر الإضافة للشاشات الكبيرة (يخفي على الجوال) */}
  <div className="hidden md:block order-4">
    <Button 
      onClick={() => {
        setOpen(true);
        resetForm(); 
      }} 
      className="text-xs py-3 px-6 rounded-lg active text-white"
    >
      Add Hall
    </Button>
  </div>
</div>
          <Dialog
            size="sm"
            open={open}
            handler={(val) => {
              setOpen(val);
              if (!val) resetForm(); // إعادة التعيين عند الإغلاق
            }}
            className="p-4 rounded-xl shadow-xl"
          >
            <DialogHeader className="relative m-0 block bg-blue-800 text-white p-4 rounded-t-xl">
              <Typography variant="h4" className="text-white">
                {isEdit ? "Modify Hall" : "Add New Hall"}
              </Typography>
              <IconButton
                size="sm"
                variant="text"
                className="!absolute right-3.5 top-3.5 text-white"
                onClick={() => setOpen(false)}
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
                  Hall Name
                </Typography>
                <Input
                  size="lg"
                  className="!border-[1.5px] !border-gray-200 focus:!border-blue-800"
                  value={hall.name}
                  onChange={handleChange}
                  name="name"
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-gray-700 font-medium"
                >
                  Hall Type
                </Typography>
                <Select
                  value={hall.type.toString()}
                  onChange={(value) =>
                    setHall({ ...hall, type: value === "true" })
                  }
                  className="!border-[1.5px] !border-gray-200 focus:!border-blue-800"
                >
                  <Option value="false">Lecture Hall</Option>
                  <Option value="true">Sections</Option>
                </Select>
              </div>

              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-gray-700 font-medium"
                >
                  Capacity
                </Typography>
                <Input
                  type="number"
                  size="lg"
                  className="!border-[1.5px] !border-gray-200 focus:!border-blue-800"
                  value={hall.capacity}
                  onChange={handleChange}
                  name="capacity"
                />
              </div>
            </DialogBody>

            <DialogFooter className="px-4 pb-4">
              <Button
                className={`${
                  !hall.name.trim() ||
                  !hall.capacity ||
                  isNaN(hall.capacity) ||
                  parseInt(hall.capacity) <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-800 hover:bg-blue-900"
                } text-white px-6 py-3 rounded-lg`}
                onClick={handleSubmit}
                disabled={
                  !hall.name.trim() ||
                  !hall.capacity ||
                  isNaN(hall.capacity) ||
                  parseInt(hall.capacity) <= 0
                }
              >
                {isEdit ? "Save Modify" : "Submit"}
              </Button>
            </DialogFooter>
          </Dialog>

          {/* تعديل الجدول */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                    No.
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                    Hall Name
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                    Hall Type
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-white uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Lecture Halls Section */}
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-2 text-center bg-gray-700 text-white font-bold"
                  >
                    Lecture Halls
                  </td>
                </tr>
                {lectureHalls.map((hall, index) => (
                  <tr key={hall.id} className="hover:bg-black">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {hall.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      Lecture Hall
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {hall.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center text-lg font-semibold rounded-lg border border-transparent text-blue-500 hover:text-blue-800 focus:outline-hidden focus:text-blue-800"
                        onClick={() => handleEdit(hall)}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        className="inline-flex text-lg font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-700 focus:outline-hidden focus:text-red-700"
                        onClick={() => {
                          setSelectedHallId(hall.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Section Halls Section */}
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-2 text-center bg-gray-700 text-white font-bold"
                  >
                    Section Halls
                  </td>
                </tr>
                {sectionHalls.map((hall, index) => (
                  <tr key={hall.id} className="hover:bg-black">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {hall.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      Section
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {hall.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center text-lg font-semibold rounded-lg border border-transparent text-blue-500 hover:text-blue-800 focus:outline-hidden focus:text-blue-800"
                        onClick={() => handleEdit(hall)}
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        type="button"
                        className="inline-flex text-lg font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-700 focus:outline-hidden focus:text-red-700"
                        onClick={() => {
                          setSelectedHallId(hall.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && filteredHalls.length === 0 && (
            <div className="text-center py-4 text-white">
              Not Available Data
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GetHalls;
