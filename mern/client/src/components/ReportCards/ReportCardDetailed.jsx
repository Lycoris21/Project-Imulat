import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/time';
import { truncateWords } from '../../utils/strings';
import { getVerdictColor } from '../../utils/colors';

const ReportCardDetailed = ({ report }) => (
    <Link
        key={report._id}
        to={`/reports/${report._id}`}
        className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl w-full sm:w-80 md:w-96 transition-all duration-300 transform hover:-translate-y-1 group"
    >
        {/* Cover Image */}
        {report.reportCoverUrl && (
            <div className="h-48 overflow-hidden">
                <img
                    src={report.reportCoverUrl}
                    alt={`Cover for ${report.reportTitle}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                    }}
                />
            </div>
        )}

        {/* Content */}
        <div className="p-6">
            {/* Header with Verdict */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-selected transition-colors flex-1 mr-3 line-clamp-2 min-h-[2.75em]">
                    {report.reportTitle}
                </h3>
                <span className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${getVerdictColor(report.truthVerdictParsed)}`}>
                    {report.truthVerdictParsed}
                </span>
            </div>

            {/* AI Summary */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4rem]">
                <span className="font-medium">AI-generated summary:</span> {truncateWords(report.aiReportSummary)}
            </p>                  
            {/* Author & Claim Count */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                <span>By <span className="font-medium">{report.userId?.username || "Unknown"}</span></span>
                {report.claims?.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {report.claims?.length} claim{report.claims?.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Stats & Date */}
            <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                    {/* Likes */}
                    <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{report.reactionCounts.like}</span>
                    </span>

                    {/* Dislikes */}
                    <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{report.reactionCounts.dislike}</span>
                    </span>

                    {/* Comments */}
                    <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span>{report.commentCount || 0}</span>
                    </span>
                </div>

                {/* Date */}
                <span className="italic">{formatRelativeTime(report.createdAt)}</span>
            </div>
        </div>
    </Link>
);

export default ReportCardDetailed;