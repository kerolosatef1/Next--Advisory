import React from "react";
import { useNavigate } from 'react-router-dom';
import imgLOGO from '../../assets/imagelogo.webp';


export default function LearnMore() {
  const navigate = useNavigate();

  const handleGetStart = () => {
    const token = localStorage.getItem("userToken");
    if (token) {
      navigate("/proffesors");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-black text-white font-['Space_Grotesk'] overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl"></div>
        
        <div className="absolute inset-0 grid grid-cols-12 opacity-5 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-cyan-500"></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 opacity-5 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-b border-cyan-500"></div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/70 backdrop-blur-lg border-b border-cyan-500/30 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-md blur-sm"></div>
                <div className="w-10 h-10 rounded-md from-indigo-600 to-purple-600 border border-indigo-400/30 flex items-center justify-center relative shadow-lg shadow-indigo-800/20">
                  <div className="absolute inset-[3px] bg-gray-900 rounded-[4px] flex items-center justify-center overflow-hidden">
                    <img src={imgLOGO} className="h-8 rounded-sm" alt="imgLogo" />
                  </div>
                </div>
              </div>
              <div className="text-xl font-medium bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                Next Advisory
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              <button onClick={() => navigate("/")} className="px-4 py-2 rounded-md transition-colors duration-200 text-gray-300 hover:text-cyan-400">
                Back to Home
              </button>
              <div className="relative ml-4 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition-all duration-500"></div>
                <button onClick={handleGetStart} className="contact-btn px-4 py-2 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 rounded-lg text-white text-sm font-medium relative z-10 flex items-center justify-center gap-2 group-hover:from-indigo-800/90 group-hover:to-purple-800/90 transition-all duration-300">
                  <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">Get Start</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="container mx-auto px-6 py-20">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl"></div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent pb-2 relative">
                  Learn More About Our System
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-8">
                Discover how our Automatic University Timetable Scheduling System revolutionizes academic scheduling with advanced algorithms and intuitive interfaces.
              </p>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-8">
                Our system helps universities to extract a complete study schedule without any conflicts and matching the halls and their types, whether lecture halls or sections, and the availability times for doctors and teaching assistants and the study materials, and from it study schedules will be extracted for the study groups and a schedule for the halls and schedules for doctors and teaching assistants and making schedules for non-regular students who take additional hours or take hours less than the basic hours for the study group and extracting schedules for them and from it extracting pdf, word with every schedule for everything
              </p>
            </div>
          </div>
        </section>



    

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <div className="inline-block mb-3">
                <div className="text-xs text-cyan-400 tracking-widest uppercase mb-1">Core Features</div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  How It Works
                </h2>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-indigo-500/20 rounded-lg p-6 relative z-10 h-full group-hover:border-indigo-500/40 transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded bg-indigo-900/60 flex items-center justify-center mr-3 group-hover:bg-indigo-800/70 transition-colors">
                        <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg text-indigo-300 group-hover:text-indigo-200 transition-colors">Data Integration</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Our system seamlessly integrates with university databases to pull course information, professor availability, and classroom resources.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/20 rounded-lg p-6 relative z-10 h-full group-hover:border-purple-500/40 transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded bg-purple-900/60 flex items-center justify-center mr-3 group-hover:bg-purple-800/70 transition-colors">
                        <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg text-purple-300 group-hover:text-purple-200 transition-colors">Smart Scheduling</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Advanced algorithms analyze all constraints and preferences to generate optimal schedules with zero conflicts in minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-500/20 rounded-lg p-6 relative z-10 h-full group-hover:border-cyan-500/40 transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded bg-cyan-900/60 flex items-center justify-center mr-3 group-hover:bg-cyan-800/70 transition-colors">
                        <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <h3 className="font-medium text-lg text-cyan-300 group-hover:text-cyan-200 transition-colors">Real-time Updates</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Any changes propagate instantly across all views, ensuring everyone has access to the most current schedule information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 bg-gradient-to-b from-gray-900/50 to-gray-950/50">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <div className="inline-block mb-3">
                <div className="text-xs text-cyan-400 tracking-widest uppercase mb-1">Our Technology</div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Built With Modern Tech
                </h2>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-sm group-hover:bg-indigo-500/30 transition-all duration-500"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-lg border border-indigo-500/20 p-6 rounded-xl shadow-xl group-hover:border-indigo-500/40 transition-all duration-300">
                  <h3 className="font-medium text-xl text-white mb-3">Frontend Architecture</h3>
                  <p className="text-gray-400 mb-4">
                    Our responsive UI is built with React.js, Tailwind CSS, and Redux for state management, delivering a smooth user experience across all devices.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">React</span>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">JSX</span>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">Tailwind</span>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">Redux</span>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">Yup Validation</span>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">Cooperate with Different Libriries</span>

                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-sm group-hover:bg-purple-500/30 transition-all duration-500"></div>
                <div className="relative bg-gray-900/70 backdrop-blur-lg border border-purple-500/20 p-6 rounded-xl shadow-xl group-hover:border-purple-500/40 transition-all duration-300">
                  <h3 className="font-medium text-xl text-white mb-3">Backend & Algorithm</h3>
                  <p className="text-gray-400 mb-4">
                    The scheduling engine is powered by C++ for maximum performance, with a .NET API layer for integration and C# for database operations.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">C++</span>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">.NET</span>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">C#</span>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">SQL</span>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">JSON Files</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <div className="inline-block mb-3">
                <div className="text-xs text-cyan-400 tracking-widest uppercase mb-1">Why Choose Us</div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Key Benefits
                </h2>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  title: "Time Savings",
                  description: "Reduce scheduling time from weeks to minutes with our automated system.",
                  icon: (
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )
                },
                {
                  title: "Conflict-Free",
                  description: "Eliminate scheduling conflicts for professors, students, and classrooms.",
                  icon: (
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )
                },
                {
                  title: "Customizable",
                  description: "Tailor the system to your institution's specific needs and constraints.",
                  icon: (
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  )
                },
                {
                  title: "Real-time Collaboration",
                  description: "Multiple administrators can work on schedules simultaneously with live updates.",
                  icon: (
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  )
                }
              ].map((benefit, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                  <div className="relative bg-gray-900/70 backdrop-blur-lg border border-gray-800 p-6 rounded-xl h-full group-hover:border-cyan-500/40 transition-all duration-300">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">{benefit.title}</h3>
                        <p className="text-gray-400">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-950/50 to-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                Ready to Transform Your University's Scheduling?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join the growing number of institutions that have streamlined their academic scheduling with our system.
              </p>
              <div className="relative group mx-auto max-w-xs">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition-all duration-500"></div>
                <button onClick={handleGetStart} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 rounded-lg text-white text-base font-medium relative z-10 flex items-center justify-center gap-2 group-hover:from-indigo-800/90 group-hover:to-purple-800/90 transition-all duration-300">
                  <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">Get Started Now</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-lg border-t border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-md blur-sm"></div>
                <div className="w-10 h-10 rounded-md from-indigo-600 to-purple-600 border border-indigo-400/30 flex items-center justify-center relative shadow-lg shadow-indigo-800/20">
                  <div className="absolute inset-[3px] bg-gray-900 rounded-[4px] flex items-center justify-center overflow-hidden">
                    <img src={imgLOGO} className="h-8 rounded-md" alt="imgLogo" />
                  </div>
                </div>
              </div>
              <div className="text-xl font-medium bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                Next Advisory
              </div>
            </div>
            
            <div className="text-center text-gray-500 text-sm">
              © 2025 Next Advisory. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}