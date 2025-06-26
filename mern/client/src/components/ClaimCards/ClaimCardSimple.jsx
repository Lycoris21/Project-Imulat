import { Link } from 'react-router-dom';
import { getTruthIndexColor } from '../../utils/colors';
import ReportIcon from '../../components/icons/ReportIcon.jsx';

const ClaimCardSimple = ({ claim }) => (
  <div key={claim._id} className="bg-white rounded-lg shadow-md p-4 border-none flex hover:bg-[#EDEEF1] transition-all duration-300 transform hover:-translate-y-1 group">
    <Link to={`/claims/${claim._id}`} className="flex-1 group-hover:text-selected cursor-pointer">
      <div className="flex justify-start items-center">
        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-selected transition-colors flex-1 mr-3 line-clamp-2">
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
        <span className="font-medium">AI-generated summary:</span> {claim.aiClaimSummary}
      </p>
    </Link>
  </div>
);

export default ClaimCardSimple;