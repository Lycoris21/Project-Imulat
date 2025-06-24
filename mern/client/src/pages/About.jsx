import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">About Project IMULAT</h1>
          <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto">
            Empowering truth through AI-driven fact-checking and community verification
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              In an era of information overload, Project IMULAT stands as a beacon of truth. 
              We combine advanced AI technology with human expertise to verify claims, 
              debunk misinformation, and provide reliable, fact-based reporting.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our platform empowers users to submit claims for verification while accessing 
              comprehensive fact-check reports backed by credible sources and evidence.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-[#4B548B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Submit Claims</h3>
                  <p className="text-gray-600">Users submit claims they want verified</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#4B548B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">AI Analysis</h3>
                  <p className="text-gray-600">Our AI generates initial assessments and truth indices</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#4B548B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Expert Review</h3>
                  <p className="text-gray-600">Human fact-checkers create comprehensive reports</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-[#4B548B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Public Access</h3>
                  <p className="text-gray-600">Verified reports are made available to the community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">Advanced algorithms provide initial truth assessments with confidence scores</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Verification</h3>
              <p className="text-gray-600">Professional fact-checkers review and verify all claims with detailed reports</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transparent Process</h3>
              <p className="text-gray-600">All sources, methodology, and evidence are clearly documented and accessible</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#4B548B] mb-2">1,247</div>
              <div className="text-gray-600 font-medium">Claims Verified</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#4B548B] mb-2">892</div>
              <div className="text-gray-600 font-medium">Reports Published</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#4B548B] mb-2">15,432</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#4B548B] mb-2">94%</div>
              <div className="text-gray-600 font-medium">Accuracy Rate</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join the Fight Against Misinformation</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Be part of a community dedicated to truth and transparency. Submit claims, access verified reports, 
            and help build a more informed world.
          </p>          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/claims"
              className="px-8 py-4 bg-white border-2 border-[#4B548B] text-[#4B548B] font-semibold rounded-2xl shadow hover:bg-[#4B548B] hover:text-white transition"
            >
              Submit a Claim
            </Link>
            <Link
              to="/reports"
              className="px-8 py-4 bg-[#4B548B] border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-[#4B548B] transition"
            >
              Browse Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
