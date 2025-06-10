import React from "react";
import { Link } from "react-router-dom";
import usecase from "../../assets/usecase.png";
import database from "../../assets/database.png";
import entity from "../../assets/entity.png";
import sequence from "../../assets/sequense.png";



export default function Learnbackend() {
  return <>
    <div className="bg-black text-white font-['Space_Grotesk'] min-h-screen pt-20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            The set of cases that were used in the back end
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br  rounded-xl flex items-center justify-center">
              <img
                src={entity}
                alt="Group Schedule"
                className=" h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Entity Relationship Diagram
            </h2>
            <p className="text-gray-300 mb-6">
              This Entity-Relationship Diagram (ERD) defines the core structure of an automated university scheduling system. It maps:
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Key Entities
Day: Class days (e.g., Monday) with time slots.

Course: Details like Course_ID, Type, and enrollment numbers.

Professor/TA: Instructor data (Prof_id, availability).

Classroom: Room capacity, type, and location.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                 Relationships:
1-Courses link to one professor but many TAs.

2-Classrooms host one course per slot (no overlaps).

3-Days track which courses run when.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Purpose:
Ensures no scheduling conflicts (professors/rooms double-booked).

Supports auto-generating timetables based on rules.

Separates student (view-only) and admin (management) access.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br  rounded-xl flex items-center justify-center">
              <img
                src={usecase}
                alt="Group Schedule"
                className=" h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              UseCase Diagram
            </h2>
            <p className="text-gray-300 mb-6">
              How it Works :
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                 1-Managing Personnel:

You can create, edit, and delete Professor and TA records

The "Show All Professors" function allows viewing all professor records

"More details" would display additional information about each
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                 2-Course Management:

Courses can be added, edited, and deleted

Courses can be assigned to either Professors or TAs
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  3-Scheduling:

Timetables can be created either manually or automatically

Created timetables can be viewed with "Show time table"
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  4-Enterprise Function:

This might relate to institutional-level operations or reporting
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br rounded-xl flex items-center justify-center">
              <img
                src={database}
                alt="Group Schedule"
                className=" h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Database Schema
            </h2>
            <p className="text-gray-300 mb-6">
              How It Works:

            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Scheduling: The system uses availability (Sat-Fri) to assign professors/TAs to courses without conflicts.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Capacity Management: ClassRooms.Capacity ensures courses are assigned to rooms that fit enrolled students.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  Scalability: Junction tables (CourseTA, CourseProfessors) allow flexible many-to-many relationships.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative group overflow-hidden rounded-xl">
            <div className="aspect-video bg-gradient-to-br rounded-xl flex items-center justify-center">
              <img
                src={sequence}
                alt="Group Schedule"
                className=" h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Sequence Digram
            </h2>
            <p className="text-gray-300 mb-6">
              How It Works:

            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  1. Admin Login & Authentication
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  2. Manage Professors : Add/Edit/Delete Professor
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  3. Manage Teaching Assistants (TAs) : Add/Edit/Delete TA
                </p>
              </div>
               <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  4. Manage Courses : Add/Edit/Delete Course
                </p>
              </div>
               <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-300">
                  5. Timetable Management : Request Timetable Creation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900/70 backdrop-blur-lg border border-cyan-500/20 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">
            Key Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Dynamic Grouping",
                description:
                  "Automatically creates balanced groups based on student enrollment numbers",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              },
              {
                title: "Curriculum Alignment",
                description:
                  "Ensures each group's schedule meets all academic requirements",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              },
              {
                title: "Real-time Updates",
                description:
                  "Changes propagate instantly to all affected group schedules",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Conflict Resolution",
                description:
                  "Automatically resolves scheduling conflicts between groups",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-4 text-indigo-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={feature.icon}
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-colors duration-300"
          >
            Back to Main Page
          </Link>
        </div>
      </div>
    </div>
  </>
}
