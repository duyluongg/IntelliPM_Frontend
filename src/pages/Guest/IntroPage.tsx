import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Multi-Role System',
    description:
      'IntelliPM offers tailored experiences for Project Managers, Team Leaders, Team Members, Clients, and Admins with specific workflows and views.',
  },
  {
    title: 'Advanced Project Portfolio Management',
    description:
      'Oversee multiple projects with clear milestone tracking, Gantt charts, and deadline visualization across your enterprise portfolio.',
  },
  {
    title: 'Automated Task Assignment',
    description:
      'Tasks are manually or automatically assigned to the most suitable team members, reducing friction and improving productivity.',
  },
  {
    title: 'AI-Powered Reporting',
    description:
      'Generate progress reports and meeting summaries automatically using context-aware AI, with export options for clients or internal use.',
  },
  {
    title: 'Collaboration Made Seamless',
    description:
      'Real-time team communication, internal and client meetings, document/file uploads, and threaded task comments improve transparency.',
  },
  {
    title: 'Real-time Alerts and Risk Tracking',
    description:
      'Track team overloads, critical delays, and risk conditions using EVM metrics like SPI and CPI.',
  },
  {
    title: 'Secure and Auditable by Design',
    description:
      'Every action is logged with timestamps, role-based access ensures data privacy and integrity for all organizational scales.',
  },
];

export default function GuestIntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-800">
      <header className="w-full py-6 px-6 md:px-20 flex justify-between items-center shadow bg-white sticky top-0 z-50">
        <h1 className="text-3xl font-bold text-indigo-600">IntelliPM</h1>
        <Link
          to="/login"
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Sign In
        </Link>
      </header>

      <main className="px-6 md:px-20 py-16">
        <section className="text-center max-w-5xl mx-auto">
          <motion.h2
            className="text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            All-in-One Project Management for Modern Teams
          </motion.h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            IntelliPM is a powerful, enterprise-grade platform empowering project managers and their teams to manage multiple projects, communicate effectively, and automate routine workflows.
            Designed for real-world software projects and educational use, IntelliPM brings clarity, automation, and flexibility to your project management lifecycle.
          </p>
        </section>

        <motion.div
          className="mt-24 grid gap-10 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.3, duration: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow hover:shadow-xl transition duration-300"
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <section className="mt-28 bg-white rounded-2xl shadow p-10 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">
              Project Lifecycle Management
            </h3>
            <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">
              IntelliPM supports the full software development lifecycle – from planning and task assignment, to reporting and client delivery.
              Our flexible architecture adapts to team workflows while maintaining clarity and accountability.
            </p>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-slate-50 p-6 rounded-xl border">
                <h4 className="text-lg font-medium mb-2 text-indigo-700">Plan</h4>
                <p className="text-sm text-gray-600">
                  Create project plans, define milestones, tasks, and assign team members with clear priorities and due dates.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border">
                <h4 className="text-lg font-medium mb-2 text-indigo-700">Execute</h4>
                <p className="text-sm text-gray-600">
                  Teams collaborate, update progress, log work time, and share files and meeting notes in real time.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border">
                <h4 className="text-lg font-medium mb-2 text-indigo-700">Report</h4>
                <p className="text-sm text-gray-600">
                  Auto-generate progress reports, summaries, and client exports while tracking performance metrics like SPI and CPI.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-32 text-center">
          <motion.h3
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Start Exploring IntelliPM Now
          </motion.h3>
          <p className="text-gray-600 mb-6">
            No registration required to try our demo. Browse through a sample project, interact with team views, and experience the smooth interface designed for modern teams.
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-indigo-700 transition"
          >
            Try Demo Mode
          </Link>
        </section>
      </main>

      <footer className="bg-white text-center py-6 mt-24 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} IntelliPM. Built by SE students for real-world projects.
      </footer>
    </div>
  );
}