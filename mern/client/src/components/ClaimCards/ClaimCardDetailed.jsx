import { Link } from 'react-router-dom';
import { getTruthIndexColor } from '../../utils/colors';
import { formatRelativeTime } from '../../utils/time.js';
import { truncateWords } from '../../utils/strings';

const ClaimCardDetailed = ({ claim }) => (
  <div key={claim._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl min-w-[18rem] max-w-[28rem] w-full flex-shrink-0 relative transition-all duration-300 transform hover:-translate-y-1 group">
    <Link to={`/claims/${claim._id}`} className="block">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight group-hover:text-[color:var(--color-selected)] transition-colors flex-1 mr-3 line-clamp-2 min-h-[2.5em] sm:min-h-[2.75em]">
            {claim.claimTitle}
          </h3>
          <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded text-xs font-medium flex-shrink-0 ${getTruthIndexColor(claim.aiTruthIndex)}`}>
            AI Truth Index: {claim.aiTruthIndex}%
          </span>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-4 min-h-[4rem] sm:min-h-[5rem]">
          <span className="font-medium">AI-generated summary:</span> {truncateWords(claim.aiClaimSummary)}
        </p>
        <div className="flex justify-between items-center mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
          <span>By <span className="font-medium">{claim.userId?.username || "Unknown"}</span></span>
          <div className="flex items-center gap-2">
            {claim.hasReport && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                📄 Report Available
              </span>
            )}
            {claim.sources && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                Sources provided
              </span>
            )}
          </div>
        </div>
        {/* Stats & Date */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Likes */}
                <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{claim.reactionCounts.like}</span>
                </span>

                {/* Dislikes */}
                <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{claim.reactionCounts.dislike}</span>
                </span>

                {/* Comments */}
                <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span>{claim.commentCount || 0}</span>
                </span>
            </div>

            {/* Date */}
            <span className="italic text-xs sm:text-xs">{formatRelativeTime(claim.createdAt)}</span>
        </div>
      </div>
    </Link>
  </div>
);

export default ClaimCardDetailed;
