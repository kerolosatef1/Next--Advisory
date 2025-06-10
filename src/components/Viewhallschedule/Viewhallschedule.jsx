import React from 'react';
import { Link } from 'react-router-dom';
import hallSchedule from '../../assets/allchedule.jpeg';

export default function HallSchedulePage() {
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
            Hall Schedule Management
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <img src={hallSchedule} alt="Hall Schedule" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Efficient Hall Utilization</h2>
            <p className="text-gray-300 mb-6">
              Our system optimally assigns lecture halls and sections based on capacity, equipment requirements,
              and proximity to other scheduled activities, maximizing resource utilization.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Halls are classified by type (lecture hall, lab, etc.) and capacity (e.g., 14001 Section)
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Special requirements (projectors, lab equipment) are automatically matched
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Minimizes walking distance between consecutive classes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900/70 backdrop-blur-lg border border-blue-500/20 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Hall Scheduling Capabilities</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Smart Allocation",
                description: "Automatically assigns halls based on class size and requirements",
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              },
              {
                title: "Conflict Prevention",
                description: "Ensures no double-booking of halls or equipment",
                icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              },
              {
                title: "Specialized Labs",
                description: "Handles specialized lab scheduling with equipment requirements",
                icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              },
              {
                title: "Reporting",
                description: "Generates utilization reports to optimize hall assignments",
                icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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