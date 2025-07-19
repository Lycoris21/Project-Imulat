export default function AccuracyMeter({ percentage }) {
  const getColor = (percent) => {
    if (percent <= 50) return 'bg-red-500'; // Unreliable
    if (percent <= 69) return 'bg-yellow-500'; // Gray area
    return 'bg-green-500'; // Reliable
  };

  const getLabel = (percent) => {
    if (percent <= 50) return 'Unreliable';
    if (percent <= 69) return 'Questionable';
    return 'Reliable';
  };

  return (
    <div className="w-full mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Accuracy: {percentage}%</span>
        <span className={`text-sm font-medium ${getColor(percentage).replace('bg', 'text')}`}>
          {getLabel(percentage)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getColor(percentage)}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}