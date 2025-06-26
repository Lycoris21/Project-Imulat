import { Link } from 'react-router-dom';
import { getVerdictColor } from '../../utils/colors';
import { parseTruthVerdict } from "../../utils/strings";

const ReportCardSimple = ({ report }) => (
  <div key={report._id} className="bg-white rounded-lg shadow-md p-4 border-none flex">
    <Link to={`/reports/${report._id}`} className="flex-1 hover:text-blue-600 cursor-pointer">
      <div className="flex justify-start items-center">
        {report.reportCoverUrl && (
            <div className="flex-shrink-0">
                <img
                    src={report.reportCoverUrl}
                    alt={`Cover for ${report.title}`}
                    className="w-24 h-16 mr-4" 
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        )}

        <h3 className="font-bold text-gray-800 text-lg leading-tight hover:text-blue-600 transition-colors flex-1 mr-3 line-clamp-2">
          {report.reportTitle}
        </h3>

        <span className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${getVerdictColor(report.truthVerdictParsed)}`}>
            {report.truthVerdictParsed}
        </span>
      </div>

      <p className="text-gray-600 mt-2">
        <span className="font-medium">AI-generated summary:</span> {report.aiReportSummary}
      </p>
    </Link>
  </div>
);

export default ReportCardSimple;