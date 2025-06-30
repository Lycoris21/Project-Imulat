import { Link } from 'react-router-dom';
import { truncateWords } from '../../utils/strings';
import { getTruthIndexColor } from '../../utils/colors';
import { formatRelativeTime } from '../../utils/time';
import ReportIcon from '../../components/icons/ReportIcon.jsx';

const ClaimCardSimple = ({ claim }) => (
  <div key={claim._id} className="bg-white rounded-lg shadow-md p-4 border-none flex hover:bg-[#EDEEF1] transition-all duration-300 transform hover:-translate-y-1 group">
    <Link to={`/claims/${claim._id}`} className="flex-1 group-hover:text-[color:var(--color-selected)] cursor-pointer">
      <div className="flex justify-start items-center">
        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-[color:var(--color-selected)] transition-colors flex-1 mr-3 line-clamp-2">
          {claim.claimTitle}
        </h3>
        
        {claim.reportId && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
            <ReportIcon/>
            Report Available
          </span>
        )}

        <span className={`ml-2 px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${getTruthIndexColor(claim.aiTruthIndex)}`}>
          AI Truth Index: {claim.aiTruthIndex}%
        </span>

      </div>
      <p className="text-gray-600 mt-2">
        <span className="font-medium">AI-generated summary:</span> {truncateWords(claim.aiClaimSummary, 30)}
      </p>

      {/* Stats & Date */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center space-x-4">
          {/* Likes */}
          <span className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{claim.reactionCounts.like || 0}</span>
          </span>
          
          {/* Dislikes */}
          <span className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{claim.reactionCounts.dislike || 0}</span>
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
        <span className="italic">{formatRelativeTime(claim.createdAt)}</span>
      </div>
    </Link>
  </div>
);

export default ClaimCardSimple;