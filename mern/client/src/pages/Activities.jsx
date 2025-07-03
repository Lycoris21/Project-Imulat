import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ActivityFeed from '../components/common/ActivityFeed';
import { format } from 'date-fns';

const FilterIcon = () => (
  <svg 
    className="mr-2 text-gray-400 w-4 h-4" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fillRule="evenodd" 
      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" 
      clipRule="evenodd" 
    />
  </svg>
);

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Early return if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view your activity log.</p>
        </div>
      </div>
    );
  }

  const fetchActivities = useCallback(async (pageNum = 1, startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      let url = `/api/activities/user/${user._id}?page=${pageNum}`;
      
      if (startDate && endDate) {
        url = `/api/activities/user/${user._id}/range?page=${pageNum}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      
      // Debug logging
      console.log('Fetched activities data:', data);
      console.log('Activities array:', data.activities);
      if (data.activities && data.activities.length > 0) {
        console.log('First activity sample:', data.activities[0]);
      }
      
      if (pageNum === 1) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setHasMore(data.activities.length > 0 && data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user._id, user.token]);

  useEffect(() => {
    fetchActivities(1, dateRange?.startDate, dateRange?.endDate);
  }, [fetchActivities, dateRange]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchActivities(page + 1, dateRange?.startDate, dateRange?.endDate);
    }
  };

  const handleDateRangeChange = (event) => {
    const { name, value } = event.target;
    setDateRange(prev => {
      const newRange = { ...prev };
      
      if (value) {
        const date = new Date(value);
        
        if (name === 'startDate') {
          // Set to beginning of day (12:00 AM)
          date.setHours(0, 0, 0, 0);
          newRange[name] = date;
        } else if (name === 'endDate') {
          // Set to end of day (11:59:59 PM)
          date.setHours(23, 59, 59, 999);
          newRange[name] = date;
        }
      } else {
        newRange[name] = null;
      }
      
      return newRange;
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Activity Log</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <FilterIcon />
                    Filters
                </button>
                </div>

                {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <div className="mt-1 relative">
                        <input
                            type="date"
                            name="startDate"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-1 px-3"
                            value={dateRange?.startDate ? format(dateRange.startDate, 'yyyy-MM-dd') : ''}
                            onChange={handleDateRangeChange}
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <div className="mt-1 relative">
                        <input
                            type="date"
                            name="endDate"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-1 px-3"
                            value={dateRange?.endDate ? format(dateRange.endDate, 'yyyy-MM-dd') : ''}
                            onChange={handleDateRangeChange}
                        />
                        </div>
                    </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setDateRange(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                    </div>
                </div>
                )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <ActivityFeed activities={activities} isLoading={isLoading} />
                
                {hasMore && (
                <div className="px-4 py-4 bg-gray-50 sm:px-6 border-t border-gray-200">
                    <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                    {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Activities;
