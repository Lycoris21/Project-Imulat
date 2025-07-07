import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountUp from 'react-countup';

export default function About() {
  const [stats, setStats] = useState({
    claimsVerified: 0,
    reportsPublished: 0,
    activeUsers: 0,
    accuracyRate: "—",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            About Project IMULAT
          </h1>
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto px-4">
            Empowering truth through AI-driven fact-checking and community verification
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          {/* Mission Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Our Mission</h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
              In an era of information overload, Project IMULAT stands as a beacon of truth.
              We combine advanced AI technology with human expertise to verify claims,
              debunk misinformation, and provide reliable, fact-based reporting.
            </p>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Our platform empowers users to submit claims for verification while accessing
              comprehensive fact-check reports backed by credible sources and evidence.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">How It Works</h2>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-[color:var(--color-base)] text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-base sm:text-lg">Submit Claims</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Users submit claims they want verified</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-[color:var(--color-base)] text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-base sm:text-lg">AI Analysis</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Our AI generates initial assessments and truth indices</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-[color:var(--color-base)] text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-base sm:text-lg">Expert Review</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Human fact-checkers create comprehensive reports</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="bg-[color:var(--color-base)] text-white rounded-full w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-base sm:text-lg">Public Access</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Verified reports are made available to the community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 lg:mb-10 text-center">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">Advanced algorithms provide initial truth assessments with confidence scores</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">Expert Verification</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">Professional fact-checkers review and verify all claims with detailed reports</p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">Transparent Process</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">All sources, methodology, and evidence are clearly documented and accessible</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-center">
            <div className="p-2 sm:p-3 md:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[color:var(--color-base)] mb-1 sm:mb-2">
                <CountUp end={stats.claimsVerified} duration={1.5} />
              </div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Claims Verified</div>
            </div>
            <div className="p-2 sm:p-3 md:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[color:var(--color-base)] mb-1 sm:mb-2">
                <CountUp end={stats.reportsPublished} duration={1.5} />
              </div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Reports Published</div>
            </div>
            <div className="p-2 sm:p-3 md:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[color:var(--color-base)] mb-1 sm:mb-2">
                <CountUp end={stats.activeUsers} duration={1.5} />
              </div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Active Users</div>
            </div>
            <div className="p-2 sm:p-3 md:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[color:var(--color-base)] mb-1 sm:mb-2">
                <CountUp end={parseFloat(stats.accuracyRate)} decimals={0} suffix="%" duration={1.5} />
              </div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Accuracy Rate</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
            Join the Fight Against Misinformation
          </h2>
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed">
            Be part of a community dedicated to truth and transparency. Submit claims, access verified reports,
            and help build a more informed world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link
              to="/claims"
              className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white border-2 border-[color:var(--color-base)] text-[color:var(--color-base)] font-semibold rounded-xl sm:rounded-2xl shadow hover:bg-[color:var(--color-base)] hover:text-white transition duration-300 text-sm sm:text-base lg:text-lg"
            >
              Submit a Claim
            </Link>
            <Link
              to="/reports"
              className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-[color:var(--color-base)] border-2 border-white text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-white hover:text-[color:var(--color-base)] transition duration-300 text-sm sm:text-base lg:text-lg"
            >
              Browse Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
