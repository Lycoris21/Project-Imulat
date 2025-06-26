import { Link } from 'react-router-dom';
import { truncateWords } from '../../utils/strings';
import { getVerdictColor } from '../../utils/colors';

const ReportCardSimple = ({ report }) => (
  <div key={report._id} className="bg-white rounded-lg shadow-md p-4 border-none flex hover:bg-[#EDEEF1] transition-all duration-300 transform hover:-translate-y-1 group">
    <Link to={`/reports/${report._id}`} className="flex-1 hover:text-blue-600 cursor-pointer">
      <div className="flex justify-start items-center">
        {report.reportCoverUrl && (
          <div className="w-24 h-20 overflow-hidden rounded-lg flex-shrink-0 mr-4">
            <img
              src={report.reportCoverUrl}
              alt={`Cover for ${report.reportTitle}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>  
        )}

        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-selected transition-colors flex-1 mr-3 line-clamp-2">
          {report.reportTitle}
        </h3>

        <span className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${getVerdictColor(report.truthVerdictParsed)}`}>
            {report.truthVerdictParsed}
        </span>
      </div>

      <p className="text-gray-600 mt-2">
        <span className="font-medium">AI-generated summary:</span> {truncateWords(report.aiReportSummary, 30)}
      </p>
    </Link>
  </div>
);

export default ReportCardSimple;