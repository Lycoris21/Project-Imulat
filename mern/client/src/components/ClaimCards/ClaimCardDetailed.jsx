import { Link } from 'react-router-dom';
import { getTruthIndexColor } from '../../utils/colors';
import { formatRelativeTime } from '../../utils/time.js';
import { truncateWords } from '../../utils/strings';

const ClaimCardDetailed = ({ claim }) => (
  <div key={claim._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl w-full sm:w-80 md:w-96 relative transition-all duration-300 transform hover:-translate-y-1 group">
    <Link to={`/claims/${claim._id}`} className="block">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-selected transition-colors flex-1 mr-3 line-clamp-2">
            {claim.claimTitle}
          </h3>
          <span className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${getTruthIndexColor(claim.aiTruthIndex)}`}>
            AI Truth Index: {claim.aiTruthIndex}%
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          <span className="font-medium">AI-generated summary:</span> {truncateWords(claim.aiClaimSummary)}
        </p>
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
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
        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">👍 <span>{claim.likes}</span></span>
            <span className="flex items-center space-x-1">👎 <span>{claim.dislikes}</span></span>
            <span className="flex items-center space-x-1">💬 <span>{claim.commentCount}</span></span>
          </div>
          <span className="italic">{formatRelativeTime(claim.createdAt)}</span>
        </div>
      </div>
    </Link>
  </div>
);

export default ClaimCardDetailed;
