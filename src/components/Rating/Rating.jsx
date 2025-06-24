import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slidebar from "../Slidebar/Slidebar";
import LoadingAnimation from "../Loading/Loading";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const TableRatingManagement = () => {
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "https://timetableapi.runasp.net/api/RatingTimeTable",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setTables(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(`❌ Error fetching tables: ${err.message}`);
      }
    };

    fetchTables();
  }, []);

  const handleRateTable = async () => {
    if (!currentTable.trim()) {
      toast.warning(" Please enter a table name");
      return;
    }

    if (rating === 0) {
      toast.warning(" Please select a rating");
      return;
    }

    if (
      tables.length >= 5 &&
      !tables.some((t) => t.nameTable === currentTable)
    ) {
      toast.error("❌ Maximum of 5 tables allowed. Please delete one first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        "https://timetableapi.runasp.net/api/RatingTimeTable",
        {
          NameTable: currentTable,
          rate: rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data === "done") {
        toast.success(" Table rated successfully!");
        const updatedResponse = await axios.get(
          "https://timetableapi.runasp.net/api/RatingTimeTable",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTables(updatedResponse.data);
        setCurrentTable("");
        setRating(0);
      }
    } catch (err) {
      toast.error(`❌ Error: ${err.response?.data || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchTable = async (tableName) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        `https://timetableapi.runasp.net/api/RatingTimeTable/${tableName}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data === "you are in the same table") {
        toast.info(" You are already using this table");
      } else {
        toast.success(` Successfully switched to table: ${tableName}`);
      }
    } catch (err) {
      toast.error(
        `❌ Failed to switch table: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;

    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `https://timetableapi.runasp.net/api/RatingTimeTable/${selectedTable}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(` Table "${selectedTable}" deleted successfully`);
      const updatedTables = await axios.get(
        "https://timetableapi.runasp.net/api/RatingTimeTable",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTables(updatedTables.data);
      setDeleteModalOpen(false);
      setSelectedTable(null);
    } catch (err) {
      toast.error(
        `❌ Failed to delete table: ${
          err.response?.data?.message || err.message
        }`
      );
      setDeleteModalOpen(false);
    }
  };

  const openDeleteModal = (tableName) => {
    setSelectedTable(tableName);
    setDeleteModalOpen(true);
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

  return (
    <div className="background-main-pages">
      <Slidebar />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
        <DialogHeader>
          Delete Table
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
              This will permanently delete the table "{selectedTable}" and all
              its ratings.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button color="red" onClick={handleDeleteTable} className="mr-2">
            Delete
          </Button>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
        </DialogFooter>
      </Dialog>

      <div className="min-h-screen p-4 md:p-8">
        <header className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Timetable Rating System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Rate and manage your timetable tables (Maximum 5 tables)
          </p>
        </header>

        <main className="max-w-4xl mx-auto space-y-8">
          {/* Rating Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Rate Current Timetable and Data storage
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Timetable Name
                </label>
                <input
                  type="text"
                  value={currentTable}
                  onChange={(e) => setCurrentTable(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter timetable name"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Your Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`text-3xl focus:outline-none ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      aria-label={`Rate ${star} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <button
                onClick={handleRateTable}
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded font-medium ${
                  isSubmitting ? "bg-blue-400 cursor-not-allowed" : "active"
                } text-white transition-colors`}
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>

          {/* Tables List */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Rated Timetables
              </h2>
              <span className="text-sm text-gray-500">
                {tables.length} of 5 tables
              </span>
            </div>

            {tables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tables rated yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tables.map((table) => (
                  <div key={table.nameTable} className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {table.nameTable}
                        </h3>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xl ${
                                star <= table.rate
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSwitchTable(table.nameTable)}
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => openDeleteModal(table.nameTable)}
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TableRatingManagement;
