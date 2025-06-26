import ClaimCardSimple from './ClaimCardSimple';
import ClaimCardCompact from './ClaimCardCompact';
import ClaimCardDetailed from './ClaimCardDetailed';

const ClaimCard = ({ claim, variant = 'simple' }) => {
  switch (variant) {
    case 'compact':
      return <ClaimCardCompact claim={claim} />;
    case 'detailed':
      return <ClaimCardDetailed claim={claim} />;
    case 'simple':
    default:
      return <ClaimCardSimple claim={claim} />;
  }
};

export default ClaimCard;