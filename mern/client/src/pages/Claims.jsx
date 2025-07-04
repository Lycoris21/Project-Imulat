import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useQueryParams from "../hooks/useQueryParams";
import { LoadingScreen, ClaimCard, SearchBar, SubmitClaimModal, SuccessToast, PaginationControls } from '../components';

export default function Claims() {
  const { isLoggedIn = false } = useAuth() || {};
  const { search, sort, page, user: queryUser , updateParams } = useQueryParams();

  const [searchQuery, setSearchQuery] = useState(search);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [totalClaims, setTotalClaims] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchClaims();
  }, [search, sort, page, queryUser ]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchQuery.trim(), page: 1 });
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setSearchLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort,
      });
      if (search.trim()) params.append("search", search.trim());
      if (queryUser ?.trim()) params.append("user", queryUser .trim());

      const response = await fetch(`http://localhost:5050/api/claims?${params}`);
      const data = await response.json();
      setClaims(data.claims || data);
      setTotalClaims(data.total || data.length || 0);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSubmitFinish = async (successType) => {
    await fetchClaims();
    if (successType === 'claimSubmitted') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    }
  };

  const totalPages = Math.ceil(totalClaims / itemsPerPage);
  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <LoadingScreen message="Loading claims..." />;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(to_bottom,_#4B548B_0%,_#2F3558_75%,_#141625_100%)] px-4 py-8">
      {/* Success Notification */}
      <SuccessToast 
        message="Claim submitted successfully!" 
        visible={showSuccessMessage} 
        onClose={() => setShowSuccessMessage(false)} 
      />

      {/* Header + Controls */}
      <div className="mb-8">
        <div className="relative mb-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">All Claims</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">Browse through all user-submitted claims for fact-checking</p>
          {isLoggedIn && (
            <div className="absolute top-0 right-0">
              <button onClick={() => setShowSubmitModal(true)} className="px-6 py-3 bg-[color:var(--color-dark)] text-white border border-gray-400 font-semibold rounded-2xl shadow-lg hover:bg-[#1E275E80] transition-all duration-200 flex items-center gap-2 cursor-pointer">
                + Submit A Claim
              </button>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto mb-6">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearch}
            placeholder="Search claims by title, content, author, or summary..."
            isLoading={searchLoading}
          />

          <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
                className="px-2 py-1 rounded-md bg-white text-[color:var(--color-dark)] border border-gray-300 cursor-pointer text-xs min-w-[120px]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="mostLiked">Most Liked</option>
                <option value="mostCommented">Most Commented</option>
                <option value="hottest">Hottest</option>
                <option value="highestTruth">Highest Truth Index</option>
              </select>
            </div>
            {claims.length > 0 && totalPages > 1 && (
              <PaginationControls 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange}
                className="justify-center"
              />
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm">
              {totalClaims} claim{totalClaims !== 1 ? 's' : ''} found
              {totalPages > 1 && <span className="ml-2 text-gray-400">• Page {page} of {totalPages}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {claims.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-lg mb-4">No claims found</div>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {claims.map((claim) => (
              <ClaimCard key={claim._id} claim={claim} variant="detailed" />
            ))}
          </div>
        )}

        {claims.length > 0 && totalPages > 1 && (
          <div className="mt-12">
            <PaginationControls 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange}
              className="justify-center"
            />
          </div>
        )}
      </div>

      <SubmitClaimModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} onSubmitFinish={handleSubmitFinish} />
    </div>
  );
}
