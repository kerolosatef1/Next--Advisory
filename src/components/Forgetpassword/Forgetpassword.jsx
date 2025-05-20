import React from "react";
import imgLOGO from '../../assets/imagelogo.jpeg';
import { useFormik } from "formik";
import * as Yup from 'yup';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from "react-router-dom";

export default function Resetpassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // استخراج البيانات من الرابط
    const initialEmail = decodeURIComponent(queryParams.get('email')) || '';
    const token = decodeURIComponent(queryParams.get('token')) || '';

    // تحقق من صحة الرابط
    if (!initialEmail || !token || token === "undefined") {
        toast.error("رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.");
        navigate('/forget-password');
        return;
    }

    // مخطط التحقق من الصحة
    const validationSchema = Yup.object({
        newPassword: Yup.string()
            .matches(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                'Password must start with a capital letter and contain a symbol and numbers'
            )
            .required('required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], 'Password and re-password do not match')
            .required('Re-password is required')
    });

    // إرسال البيانات إلى الخادم
const handleReset = async (values) => {
  try {
    // 1. استخراج وفك تشفير الرمز
    const tokenFromURL = new URLSearchParams(location.search).get("token");
    const decodedToken = decodeURIComponent(tokenFromURL);

    // 2. التحقق من صحة الرمز والبريد
    if (!decodedToken || !initialEmail) {
      toast.error("الرابط غير صالح. يرجى طلب رابط جديد.");
      navigate("/forget-password");
      return;
    }

    // 3. إرسال البيانات إلى الخادم
    const response = await axios.post(
      "https://timetableapi.runasp.net/api/Auth/resetPassword",
      {
        email: initialEmail,
        token: decodedToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }
    );

    // 4. إذا نجح الطلب
    if (response.status === 200) {
      toast.success("Successful New Password");
      navigate("/login");
    }
  } catch (error) {
    // 5. معالجة الخطأ
    const errorMessage = error.response?.data?.[0]?.description || "فشل إعادة التعيين. الرجاء المحاولة لاحقًا.";
    toast.error(errorMessage);
    console.error("تفاصيل الخطأ:", error.response?.data);
  }
};

    // تهيئة الفورميك
    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema,
        onSubmit: handleReset
    });


    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <ToastContainer position="top-right" autoClose={5000} />
            
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    <img className="w-8 h-8 mr-2" src={imgLOGO} alt="logo" />
                    NEXT Advisory
                </a>
                
                <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                    <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                       Change Password
                    </h2>

                    <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4 lg:mt-5 md:space-y-5">
                    
                        <div>
                            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                               New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.newPassword}
                            />
                            {formik.touched.newPassword && formik.errors.newPassword && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.newPassword}</p>
                            )}
                        </div>

                  
                        <div>
                            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                               Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="••••••••"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* زر الإرسال */}
                        <button
                            type="submit"
                            disabled={!formik.isValid || !formik.dirty}
                            className="w-full text-white active focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                        >
                          Submmit
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}