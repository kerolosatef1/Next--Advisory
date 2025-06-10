import React from 'react';
import { Link } from 'react-router-dom';
import specialStudent from '../../assets/specialstudent.jpeg';
import inputstudent from '../../assets/allst.jpg';


export default function SpecialStudentSchedulePage() {
  return (
    <div className="bg-black text-white font-['Space_Grotesk'] min-h-screen pt-20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Special Student Schedule Management
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <img src={specialStudent} alt="Special Student Schedule" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Customized Academic Paths</h2>
            <p className="text-gray-300 mb-6">
              Our system handles students with non-standard credit hour requirements, creating personalized schedules
              that accommodate their unique academic situations while maintaining all necessary prerequisites.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Accommodates students with reduced or increased course loads
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Handles make-up courses and prerequisite exceptions
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Maintains academic integrity while providing flexibility
                </p>
              </div>
            </div>
          </div>
        </div>
<div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <img src={inputstudent} alt="Special Student Schedule" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Display All Special Student .</h2>
            <p className="text-gray-300 mb-6">
             Our system can automatically, after settling on the schedule, store all data of students who have extra hours or fewer hours, and students can be deleted if the supervisor wants, and the schedules of those students can be exported in PDF, Word, or Excel formats.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Store data of all private students
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Store the table that has been settled on. If it is modified, the data will be modified here directly.
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Export Tables All Student PDF,WORD,EXCEL
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Features */}
        <div className="bg-gray-900/70 backdrop-blur-lg border border-blue-500/20 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Special Student Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Flexible Scheduling",
                description: "Creates schedules outside standard credit hour ranges",
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              },
              {
                title: "Prerequisite Management",
                description: "Ensures all course prerequisites are met even with non-standard paths",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              },
              {
                title: "Progress Tracking",
                description: "Monitors special students' progress toward degree requirements",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              },
              {
                title: "Advisor Integration",
                description: "Facilitates communication with academic advisors",
                icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4 text-blue-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/" className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white hover:from-cyan-700 hover:to-blue-700 transition-colors duration-300">
            Back to Main Page
          </Link>
        </div>
      </div>
    </div>
  );
}