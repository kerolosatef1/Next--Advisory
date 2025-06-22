import { useState } from 'react'
import './App.css'
import Home from './components/Home/Home';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Notfound from './components/Notfound/Notfound';
import About from './components/About/About';
import Features from './components/Features/Features';
import Servic from './components/Servic/Servic';
import ContactUs from './components/ContactUs/ContactUs';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Slidebar from './components/Slidebar/Slidebar';
import Proffesors from './components/Proffesors/Proffesors';
import Teachingassistant from './components/TeachingAssisstant/TeachingAssisstant';
import Halls from './components/Halls/Halls';
import GetCourses from './components/Courses/Courses';
import PostProfessors from './components/Postprofessor/Postprofessor';
import CourseProfessors from './components/Postprofessor/Postprofessor';
import LoadingScreen from './components/Loading/Loading';
import UserContextProvider from './components/UserContext/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRouting from './components/ProtectRouting/ProtectRouting';
import { Toaster } from 'react-hot-toast';
import Etnerlife from './components/Etnerlife/Etnerlife';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Resetpassword from './components/Resetpassword/Resetpassword';
import Forgetpassword from './components/Forgetpassword/Forgetpassword';
import Senddataschedule from './components/Senddataschedule/Senddataschedule';
import TimetablePage from './components/TimetablePage/TimetablePage';

import ClassroomTimetable from './components/Hallschedule/Hallschedule';
import ProfessorTimetable from './components/ProfessorSchedule/ProfessorSchedule';
import SpecialStudent from './components/SpecialCaseStudent/SpecialCaseStudent';
import StudentTimetable from './components/AllSpecialCaseStudent/AllSpecialCaseStudent';
import Learnmore from './components/Learnmore/Learnmore';
import LearnMore from './components/Learnmore/Learnmore';
import GroupSchedulePage from './components/Viewgroupschedule/Viewgroupschedule';
import HallSchedulePage from './components/Viewhallschedule/Viewhallschedule';
import ProfessorSchedulePage from './components/Viewprofessorschedule/Viewprofessorschedule';
import SpecialStudentSchedulePage from './components/Viewspecialstudentschedule/Viewspecialstudentschedule';
import Learnbackend from './components/Leranbackend/Leranbackend';
import SameSpecialStudent from './components/SameSpecialStudent/SameSpecialStudent';
import ProfessorAnalysis from './components/AnalysisPagee/AnalysisPagee';
import TeachingAssistantAnalysis from './components/AnalysisTeachingAssistant/AnalysisTeachingAssistant';
import ClassroomAnalysis from './components/LectureClassRoom/LectureClassRoom';


let query=new QueryClient({
  defaultOptions : {
    queries: {
      
    },
  },
}); 

function App() {
  let x= createBrowserRouter([
    {path:'',element:<Layout/>,children:[
      {index:true,element:<Home/>},
      {path:'about',element:<ProtectedRouting><About/></ProtectedRouting>},
      {path:'features',element:<ProtectedRouting><Features/></ProtectedRouting>},
      {path:'servic',element:<ProtectedRouting><Servic/></ProtectedRouting>},
      {path:'contactus',element:<ProtectedRouting><ContactUs/></ProtectedRouting>}, 
      {path:'slidebar',element:<ProtectedRouting><Slidebar/></ProtectedRouting>},
      {path:'proffesors',element:<ProtectedRouting><Proffesors/></ProtectedRouting>},
      {path:'teachingassistant',element:<ProtectedRouting><Teachingassistant/></ProtectedRouting>},
      {path:'entery',element:<ProtectedRouting><Etnerlife/></ProtectedRouting>},
      {path:'halls',element:<ProtectedRouting><Halls/></ProtectedRouting>},
      {path:"courses",element:<ProtectedRouting><GetCourses/></ProtectedRouting>},
      {path:'postprofessor',element:<ProtectedRouting><CourseProfessors/></ProtectedRouting>},
      {path:'loading',element:<ProtectedRouting><LoadingScreen/></ProtectedRouting>},
      {path:'generate-schedule',element:<ProtectedRouting><Senddataschedule/></ProtectedRouting>},
      {path:'timetable',element:<ProtectedRouting><TimetablePage/></ProtectedRouting>},
      {path:'hall-schedule',element:<ProtectedRouting><ClassroomTimetable/></ProtectedRouting>},
      {path:'professor-schedule',element:<ProtectedRouting><ProfessorTimetable/></ProtectedRouting>},
      {path:'special-student',element:<ProtectedRouting><SpecialStudent/></ProtectedRouting>},
      {path:'same-similar-timetable',element:<ProtectedRouting><SameSpecialStudent/></ProtectedRouting>},
      {path:'all-special-student',element:<ProtectedRouting><StudentTimetable/></ProtectedRouting>},
      {path:'analysis-professor',element:<ProtectedRouting><ProfessorAnalysis/></ProtectedRouting>},
      {path:'analysis-teachingassistant',element:<ProtectedRouting><TeachingAssistantAnalysis/></ProtectedRouting>},
      {path:'analysis-lecture-halls',element:<ProtectedRouting><ClassroomAnalysis/></ProtectedRouting>},





      

      {path:'learn-more',element:<LearnMore/>},
      {path:'learn/backend',element:<Learnbackend/>},

      {path:'view-group-schedule',element:<GroupSchedulePage/>},
      {path:'view-hall-schedule',element:<HallSchedulePage/>},
      {path:'view-professor-schedule',element:<ProfessorSchedulePage/>},
      {path:'view-specialstudent-schedule',element:<SpecialStudentSchedulePage/>},

      {path:'login',element:<Login/>},
      {path:'register',element:<Register/>},
      {path:'reset-password',element:<Resetpassword/>},
      {path:'forget-password',element:<Forgetpassword/>},
      {path:'*',element:<Notfound/>}
    ]}
  ])
  
 

  return (
    <>
     <QueryClientProvider client={query}>
    <UserContextProvider>
   <RouterProvider router={x}></RouterProvider>
  <ReactQueryDevtools initialIsOpen={false}/>
   <Toaster/>
   </UserContextProvider>
   </QueryClientProvider>
    </>
  )
}
export default App