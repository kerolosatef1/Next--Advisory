import React from 'react';
import { Link } from 'react-router-dom';
import professorschedule from '../../assets/rofessorchedule.webp';

export default function ProfessorSchedulePage() {
  return (
    <div className="bg-black text-white font-['Space_Grotesk'] min-h-screen pt-20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Professor Schedule Management
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
              <img src={professorschedule} alt="Professor Schedule" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Optimized Teaching Assignments</h2>
            <p className="text-gray-300 mb-6">
              Our system intelligently distributes teaching assignments while respecting professor preferences,
              availability, and areas of expertise, creating balanced workloads.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Matches professors to courses based on their specialties and preferences
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Respects time constraints and preferred teaching times
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Balances workload evenly across faculty members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900/70 backdrop-blur-lg border border-pink-500/20 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-pink-400 mb-6">Professor Scheduling Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Expertise Matching",
                description: "Ensures professors teach subjects in their areas of expertise",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              },
              {
                title: "Workload Balance",
                description: "Distributes teaching hours fairly among faculty",
                icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              },
              {
                title: "Availability Respect",
                description: "Honors professor's preferred working hours and days",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              },
              {
                title: "Conflict Avoidance",
                description: "Prevents scheduling conflicts with research or other commitments",
                icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4 text-pink-400">
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
          <Link to="/" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white hover:from-purple-700 hover:to-pink-700 transition-colors duration-300">
            Back to Main Page
          </Link>
        </div>
      </div>
    </div>
  );
}