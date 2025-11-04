import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, X, Loader2, Check, Bookmark, Building2, Users2, TrendingUp } from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [saving, setSaving] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experienceLevel: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'saved', 'applied'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchJobs(1, searchTerm, filters);
  }, [activeTab]);

  const fetchJobs = async (page = 1, search = searchTerm, appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        q: search || undefined,
        ...(appliedFilters.location && { location: appliedFilters.location }),
        ...(appliedFilters.jobType && { type: appliedFilters.jobType }),
        ...(appliedFilters.experienceLevel && { experience: appliedFilters.experienceLevel }),
        ...(activeTab === 'saved' && { saved: true }),
        ...(activeTab === 'applied' && { applied: true })
      };
      
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      const response = await jobsAPI.getAllJobs(params);
      const { data: fetchedJobs = [], total = 0, totalPages = 1 } = response.data || response;
      
      setJobs(page === 1 ? fetchedJobs : [...jobs, ...fetchedJobs]);
      setPagination({
        page,
        limit: 10,
        total,
        totalPages
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApply = async (jobId) => {
    if (applying[jobId]) return;

    try {
      setApplying(prev => ({ ...prev, [jobId]: true }));
      await jobsAPI.applyToJob(jobId);
      
      setJobs(prev => prev.map(job => 
        job._id === jobId 
          ? { ...job, hasApplied: true } 
          : job
      ));
      
      toast.success('Application submitted successfully! 🎉');
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error(error.response?.data?.message || 'Failed to apply to job');
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };
  
  const handleSaveJob = async (jobId) => {
    if (saving[jobId]) return;

    try {
      setSaving(prev => ({ ...prev, [jobId]: true }));
      const job = jobs.find(j => j._id === jobId);
      
      if (job?.isSaved) {
        await jobsAPI.unsaveJob(jobId);
        toast.success('Job removed from saved');
      } else {
        await jobsAPI.saveJob(jobId);
        toast.success('Job saved! 📌');
      }
      
      setJobs(prev => prev.map(job => 
        job._id === jobId 
          ? { ...job, isSaved: !job.isSaved } 
          : job
      ));
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setSaving(prev => ({ ...prev, [jobId]: false }));
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      experienceLevel: ''
    });
    setSearchTerm('');
    fetchJobs(1, '', {
      location: '',
      jobType: '',
      experienceLevel: ''
    });
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs(1, searchTerm, filters);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchJobs(pagination.page + 1);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs(1, searchTerm, filters);
  };

  const activeFiltersCount = [filters.location, filters.jobType, filters.experienceLevel].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Job Search</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover your next career opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by job title, company, or skills..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-500 relative"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-linkedin-500 text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="e.g., San Francisco, Remote"
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                    value={filters.experienceLevel}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Levels</option>
                    <option value="intern">Internship</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead/Manager</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 font-medium"
                >
                  Clear all filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-linkedin-500 text-white text-sm font-medium rounded-lg hover:bg-linkedin-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {filters.location && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  <MapPin className="w-4 h-4 mr-1" />
                  {filters.location}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, location: '' };
                      setFilters(newFilters);
                      fetchJobs(1, searchTerm, newFilters);
                    }}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.jobType && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {filters.jobType}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, jobType: '' };
                      setFilters(newFilters);
                      fetchJobs(1, searchTerm, newFilters);
                    }}
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.experienceLevel && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {filters.experienceLevel}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, experienceLevel: '' };
                      setFilters(newFilters);
                      fetchJobs(1, searchTerm, newFilters);
                    }}
                    className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-linkedin-500 text-linkedin-600 dark:text-linkedin-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                All Jobs
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'saved'
                    ? 'border-linkedin-500 text-linkedin-600 dark:text-linkedin-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Bookmark size={18} />
                  <span>Saved Jobs</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'applied'
                    ? 'border-linkedin-500 text-linkedin-600 dark:text-linkedin-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Check size={18} />
                  <span>Applied</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Job Listings */}
        {loading && jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-linkedin-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading job listings...</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {job.companyLogo ? (
                              <img 
                                src={job.companyLogo} 
                                alt={job.company} 
                                className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-linkedin-100 dark:bg-linkedin-900/30 flex items-center justify-center">
                                <Building2 className="h-7 w-7 text-linkedin-600 dark:text-linkedin-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-linkedin-500 dark:hover:text-linkedin-400 cursor-pointer">
                                  {job.title}
                                </h3>
                                <p className="text-base text-gray-700 dark:text-gray-300 font-medium">{job.company}</p>
                              </div>
                              {job.isRemote && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                  Remote
                                </span>
                              )}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                {job.location}
                              </span>
                              {job.salary && (
                                <span className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                                  {job.salary.min ? 
                                    `$${job.salary.min.toLocaleString()} - $${job.salary.max?.toLocaleString() || 'NA'}` : 
                                    'Competitive'}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                {formatDate(job.createdAt)}
                              </span>
                              {job.applicants && (
                                <span className="flex items-center">
                                  <Users2 className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                  {job.applicants} applicants
                                </span>
                              )}
                            </div>
                            {job.skills?.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {job.skills.slice(0, 6).map((skill, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    {skill}
                                  </span>
                                ))}
                                {job.skills.length > 6 && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    +{job.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 md:ml-6 flex flex-shrink-0 space-x-3">
                        <button
                          type="button"
                          onClick={() => handleApply(job._id)}
                          disabled={job.hasApplied || applying[job._id]}
                          className={`inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white transition-all ${
                            job.hasApplied 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-linkedin-500 hover:bg-linkedin-600 transform hover:scale-105'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                          {applying[job._id] ? (
                            <>
                              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Applying...
                            </>
                          ) : job.hasApplied ? (
                            <>
                              <Check className="-ml-1 mr-2 h-5 w-5" />
                              Applied
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveJob(job._id)}
                          disabled={saving[job._id]}
                          className={`inline-flex items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium transition-all ${
                            job.isSaved 
                              ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-500 disabled:opacity-70 disabled:cursor-not-allowed`}
                          title={job.isSaved ? 'Remove from saved' : 'Save job'}
                        >
                          {saving[job._id] ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            <Bookmark className={`h-5 w-5 ${job.isSaved ? 'fill-current' : ''}`} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.page < pagination.totalPages && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin inline-block mr-2 h-4 w-4" />
                      Loading...
                    </>
                  ) : (
                    `Load More Jobs (${pagination.total - jobs.length} remaining)`
                  )}
                </button>
              </div>
            )}

            {/* End Message */}
            {pagination.page >= pagination.totalPages && jobs.length > 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm font-medium">You've reached the end of the job listings</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === 'saved' 
                ? 'No saved jobs yet' 
                : activeTab === 'applied' 
                ? 'No applications yet' 
                : 'No jobs found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'saved' 
                ? 'Start saving jobs to keep track of opportunities' 
                : activeTab === 'applied' 
                ? 'Your job applications will appear here' 
                : 'Try adjusting your search or filter criteria'}
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="ml-3 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Browse All Jobs
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}