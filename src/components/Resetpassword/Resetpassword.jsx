import React, { useState } from "react";
import imgLOGO from '../../assets/imagelogo.jpeg';
import { useFormik } from "formik";
import * as Yup from 'yup';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

export default function Resetpassword() {
    
    const validationSchema = Yup.object({
        email: Yup.string()
            .required('Email is Required')
            .email('enter correct email')
    });

    const sendurl = async (values) => {
        try {
            await axios.post(
                'https://timetableapi.runasp.net/api/Auth/forgotPassword',
                {
                    email: values.email,
                    clientUrl: `http://localhost:5174/forget-password`
                }
            );
            toast.success("Check your email for reset link");
         
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || "فشل في إرسال الرابط";
            toast.error(errorMessage);
            console.error("API Error:", error.response?.data);
        }
    };

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema,
        onSubmit: sendurl
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
                        Reset Password
                    </h2>

                    <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4 lg:mt-5 md:space-y-5">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="name@company.com"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!formik.isValid || !formik.dirty}
                            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                        >
                            Reset Your Password
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}