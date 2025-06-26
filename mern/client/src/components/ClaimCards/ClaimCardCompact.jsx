import { Link } from 'react-router-dom';
import { getTruthIndexColor } from '../../utils/colors';
import { formatRelativeTime } from '../../utils/time.js';
import ReportIcon from '../../components/icons/ReportIcon.jsx';

const ClaimCardCompact = ({ claim }) => (
  <Link to={`/claims/${claim.id}`} className="block border-b border-gray-200 pb-4 last:border-b-0 shadow-sm hover:bg-[#EDEEF1] transition-colors rounded-lg p-3 m-3">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-gray-800 text-sm leading-tight flex-1 mr-2 hover:text-blue-600 transition-colors">
        {claim.claim}
      </h3>
      <div className="flex items-center gap-2 flex-shrink-0">
        {claim.reportId && (
          <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-100">
            <ReportIcon/>
            Report Available
          </span>
        )}
        <span className={`px-2 py-1 rounded text-xs font-medium ${getTruthIndexColor(claim.aiTruthIndex)}`}>
          AI Truth Index: {claim.aiTruthIndex}%
        </span>
      </div>
    </div>
    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
      <span className="font-medium">AI-generated summary:</span> {claim.aiSummary}
    </p>
    <div className="flex justify-between items-center text-xs text-gray-500">
      <span>Submitted by: <span className="font-medium">{claim.submittedBy}</span></span>
      <div className="flex items-center space-x-3">
        <span className="flex items-center space-x-1">
          👍 <span>{claim.likes}</span>
        </span>
        <span className="flex items-center space-x-1">
          👎 <span>{claim.dislikes}</span>
        </span>
        <span className="flex items-center space-x-1">
          💬 <span>{claim.commentCount}</span>
        </span>
        <span className="italic">{formatRelativeTime(claim.date)}</span>
      </div>
    </div>
  </Link>
);

export default ClaimCardCompact;