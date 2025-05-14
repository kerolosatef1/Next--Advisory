import { useState, Fragment } from "react";
import axios from "axios";
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
import { XMarkIcon,ExclamationTriangleIcon  } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      <Button
        color="blue-gray"
        onClick={() => setDeleteModalOpen(false)}
      >
        Cancel
      </Button>
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
    setHall(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const { data: halls = [], isLoading, isError, error } = useQuery({
    queryKey: ['halls'],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        "https://timetableapi.runasp.net/api/ClassRooms",
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

  // طلب الإضافة/التعديل
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("userToken");
      const url = isEdit 
        ? `https://timetableapi.runasp.net/api/ClassRooms/${editHall.id}`
        : "https://timetableapi.runasp.net/api/ClassRooms";
      
      const method = isEdit ? axios.put : axios.post;
      
      const { data } = await method(url, {
        ...payload,
        userGuid: localStorage.getItem("userGuid")
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['halls']);
      toast.success(isEdit ? "Update Halls Successfull" : "تم إضافة القاعة بنجاح");
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`❌ حدث خطأ: ${error.response?.data?.message || "يرجى المحاولة لاحقًا"}`);
    }
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
            "Content-Type": "application/json"
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['halls']);
      toast.success("تم حذف القاعة بنجاح");
    },
    onError: (error) => {
      toast.error(`❌ خطأ في الحذف: ${error.response?.data?.message}`);
    }
  });

  // معالجة الإرسال
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...hall,
      capacity: parseInt(hall.capacity, 10)
    };
    mutation.mutate(payload);
  };

  // فتح نموذج التعديل
  const handleEdit = (hall) => {
    setEditHall(hall);
    setHall({
      name: hall.name,
      type: hall.type,
      capacity: hall.capacity.toString()
    });
    setIsEdit(true);
    setOpen(true);
  };

  // تصفية النتائج
  const filteredHalls = halls.filter(h => 
    h.name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <Slidebar/>
        <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
          <div className="flex justify-between items-center py-4">

            <Input
              type="text"
              placeholder="🔍 Search By Hall Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className=" w-10/12 p-2  mb-4 
              text-black bg-white
              placeholder:text-gray-400 placeholder:opacity-100
              focus:placeholder:text-gray-400"
            />
            <Button onClick={() => setOpen(true)} className="color-main">
            Add New Hall
            </Button>
          </div>

          
          <Dialog open={open} handler={() => setOpen(!open)}>
            <DialogHeader>
              {isEdit ? "Modify Hall" : "Add New Hall"}
              <IconButton
                variant="text"
                onClick={() => setOpen(false)}
                className="!absolute right-3 top-3"
              >
                <XMarkIcon className="h-5 w-5" />
              </IconButton>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Input
                  label="Hall Name"
                  name="name"
                  value={hall.name}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Hall Type"
                  value={hall.type.toString()}
                  onChange={(value) => setHall({...hall, type: value === 'true'})}
                >
                  <Option value="false">Lecture Hall </Option>
                  <Option value="true">Sections</Option>
                </Select>
                <Input
                  type="number"
                  label="capacity"
                  name="capacity"
                  value={hall.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button 
                color="green" 
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </Dialog>

          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-right">Hall name</th>
                  <th className="px-6 py-3 text-right">Hall Type</th>
                  <th className="px-6 py-3 text-right">Capacity</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHalls.map((hall) => (
                  <tr key={hall.id} className="hover:bg-black">
                    <td className="px-6 py-4 text-right">{hall.name}</td>
                    <td className="px-6 py-4 text-right">
                      {hall.type ? "Labs" : "Lectures"}
                    </td>
                    <td className="px-6 py-4 text-right">{hall.capacity}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        className="text-blue-600 p-6"
                        onClick={() => handleEdit(hall)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600"
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