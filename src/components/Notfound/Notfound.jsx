import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import imgLogo from '../../assets/imagelogo.jpeg'
export default function Notfound(){
    const [count, setCount] = useState(0);
    useEffect(() => {},[]);
    return <>
    
    <div className="min-h-screen  bg-gray-900"> 

   
   <section className=" max-w-screen-2xl mx-auto rounded-md px-4 sm:px-6 ">
    <div class="py-8 px-4 mx-auto flex max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-sm text-center">
            <a className="flex items-center text-2xl font-semibold text-white">
                            <img
                              className="rounded-lg w-16 h-16 mr-2"
                              src={imgLogo}
                              alt="logo"
                            />
                            NEXT Advisory
                          </a>
            <h1 class="mb-4 text-7xl tracking-tight font-extrabold text-green-600 lg:text-9xl text-primary-600 dark:text-primary-500">404</h1>
        
            <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Sorry, we can't find that page. You'll find lots to explore on the home page. </p>
            <Link to='/' class="inline-flex active bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Back to Homepage</Link>
        </div>   
    </div>
</section>
 </div>
    
    </>
}