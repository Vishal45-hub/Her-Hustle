import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBriefcase,
  FaPlusCircle,
  FaTrash,
  FaUsers,
  FaTimes,
  FaUserCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaBars,
} from 'react-icons/fa';
import axios from 'axios';
import OrganizerNavbar from '../organizerNavbar/OrganizerNavbar';
import OrganizerSidebar from '../organizer-sidebar/OrganizerSidebar';
import ApplicantProfile from '../applicantProfile/ApplicantProfile';
export default function OrganizerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Organizer');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [query, setQuery] = useState('');
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('/api/user/profile', {
          withCredentials: true,
        });

        // Set the actual user's name from the database
        setUserName(res.data.name || 'Organizer');
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setUserName('Organizer'); // Fallback to 'Organizer' if fetch fails
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchMyJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/jobs/my', {
          withCredentials: true,
        });

        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);


  const displayedJobs = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => (j.title || '').toLowerCase().includes(q) || (j.description || '').toLowerCase().includes(q));
  }, [jobs, query]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setJobs((prev) => prev.filter((job) => job._id !== jobId));
  };

  const fetchApplicants = async (jobId) => {
    setLoadingApplicants(true);
    setApplicantsError(null);

    console.log('=== FETCHING APPLICANTS (Frontend) ===');
    console.log('Job ID:', jobId);
    console.log('Request URL:', `/api/applications/job/${jobId}/applicants`);

    try {
      const { data } = await axios.get(
        `/api/applications/job/${jobId}/applicants`,
        { withCredentials: true }
      );

      console.log('✅ Applicants response received');
      console.log('Response data:', data);
      console.log('Number of applicants:', Array.isArray(data) ? data.length : 0);

      setApplicants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Failed to fetch applicants');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);

      setApplicantsError(
        error.response?.data?.message ||
        `Failed to load applicants: ${error.message}`
      );
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };


  const handleViewApplicants = async (e, job) => {
    e.stopPropagation();
    setSelectedJob(job);
    setShowApplicantsModal(true);
    await fetchApplicants(job._id);
  };


  const closeModal = () => {
    setSelectedJob(null);
    setApplicants([]);
    setShowApplicantsModal(false);
    setApplicantsError(null);
    setLoadingApplicants(false);
    setSelectedApplicant(null); // Add this line

  };
  const handlePostJob = () => {
    navigate('/organizer/post-job'); // ✅ Navigate instead of just logging
  };

  const applicantsCount = applicants.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-gray-50 flex">
      {/* Sidebar Component */}
      <OrganizerSidebar sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
      >
        {/* Top Navbar */}
        {/* Navbar Component */}
        <OrganizerNavbar
          userName={userName}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onPostJob={handlePostJob}
          sidebarOpen={sidebarOpen}
        />

        {/* Content Area */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-2">
                  Welcome back, {userName}
                </h1>
                <p className="text-gray-600">Manage your job postings and connect with talented professionals</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                      <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <FaBriefcase className="text-2xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                      <p className="text-3xl font-bold text-gray-900">{applicantsCount}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <FaUsers className="text-2xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Postings</p>
                      <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <FaClock className="text-2xl text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search jobs by title or description..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    aria-label="Search jobs"
                  />
                </div>
              </div>
            </div>

            {/* Jobs Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Job Postings</h2>
                <span className="text-sm text-gray-500">{displayedJobs.length} {displayedJobs.length === 1 ? 'job' : 'jobs'} found</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-20 bg-gray-200 rounded-xl mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                        <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBriefcase className="text-3xl text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or post a new job to get started</p>
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all">
                    <FaPlusCircle /> Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/30 group-hover:shadow-xl group-hover:shadow-pink-500/40 transition-all">
                          {(job.company || job.title || '').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-pink-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-xs" />
                            {job.company || 'Remote / Flexible'}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium border border-blue-100">
                          {job.type}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                          ₹{job.payment}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleViewApplicants(e, job)}
                            className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors"
                          >
                            Applicants
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job._id);
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Job Details Modal */}
        {selectedJob && !showApplicantsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div
              className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                onClick={closeModal}
                aria-label="Close"
              >
                <FaTimes />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-pink-500/30">
                  {(selectedJob.company || selectedJob.title || '').charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                  <p className="text-gray-600 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-sm" />
                    {selectedJob.company || 'Remote / Flexible'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Job Type</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedJob.type}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                  <p className="text-sm text-gray-600 mb-1">Payment</p>
                  <p className="text-lg font-semibold text-gray-900">₹{selectedJob.payment}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-medium shadow-lg shadow-pink-500/30 transition-all"
                  onClick={(e) => handleViewApplicants(e, selectedJob)}
                >
                  View Applicants
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applicants Modal */}
        {/* Applicants Modal */}
        {showApplicantsModal && selectedJob && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white w-full max-w-3xl rounded-3xl p-8 shadow-2xl max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors z-10"
                onClick={closeModal}
                aria-label="Close applicants"
              >
                <FaTimes />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Applicants</h2>
              <p className="text-gray-600 mb-6">for {selectedJob?.title}</p>

              {/* Loading State */}
              {loadingApplicants ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FaUsers className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-600">Loading applicants...</p>
                </div>
              ) : applicantsError ? (
                /* Error State */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-3xl text-red-400" />
                  </div>
                  <p className="text-red-600">{applicantsError}</p>
                  <button
                    onClick={() => fetchApplicants(selectedJob._id)}
                    className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : applicants.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-600">No applicants yet for this position</p>
                </div>
              ) : (
                /* Applicants List with Safe Property Access */
                <div className="space-y-4">
                  {applicants.map((applicant, index) => {
                    // Safe property access with fallbacks
                    const name = applicant?.seekerName || applicant?.name || 'Unknown Applicant';
                    const skills = Array.isArray(applicant?.seekerSkills) ? applicant.seekerSkills :
                      Array.isArray(applicant?.skills) ? applicant.skills : [];
                    const location = applicant?.seekerLocation || applicant?.location || 'Not specified';
                    const email = applicant?.seekerEmail || applicant?.email || '';
                    const contact = applicant?.seekerContact || applicant?.contact || applicant?.phone || '';
                    const applicantId = applicant?._id || applicant?.id || `applicant-${index}`;

                    return (
                      <div
                        key={applicantId}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-pink-200 hover:shadow-lg transition-all"
                        onClick={() => setSelectedApplicant(applicant)}

                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/30">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>

                              {/* Skills - only render if skills exist */}
                              {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {skills.map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium border border-blue-100"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Location */}
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <FaMapMarkerAlt className="text-xs" />
                                {location}
                              </p>
                            </div>
                          </div>

                          {/* Contact Buttons - only render if contact info exists */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {email && (
                              <a
                                href={`mailto:${email}`}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white text-sm font-medium shadow-lg shadow-pink-500/30 transition-all text-center whitespace-nowrap"
                              >
                                Contact
                              </a>
                            )}
                            {contact && (
                              <a
                                href={`tel:${contact}`}
                                className="text-sm text-gray-600 hover:text-pink-600 transition-colors text-center"
                              >
                                {contact}
                              </a>
                            )}
                            {!email && !contact && (
                              <span className="text-xs text-gray-400 text-center">No contact info</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Applicant Profile Modal */}
        {selectedApplicant && (
          <ApplicantProfile
            applicant={selectedApplicant}
            jobTitle={selectedJob?.title || 'Job Position'}
            onClose={() => setSelectedApplicant(null)}
          />
        )}
      </main>
    </div>
  );
}