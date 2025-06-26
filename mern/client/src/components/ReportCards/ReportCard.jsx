import ReportCardSimple from './ReportCardSimple';
import ReportCardCompact from './ReportCardCompact';
import ReportCardDetailed from './ReportCardDetailed';

const ReportCard = ({ report, variant = 'simple' }) => {
  switch (variant) {
    case 'compact':
      return <ReportCardCompact report={report} />;
    case 'detailed':
      return <ReportCardDetailed report={report} />;
    case 'simple':
    default:
      return <ReportCardSimple report={report} />;
  }
};

export default ReportCard;