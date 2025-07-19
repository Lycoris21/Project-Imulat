export default function AccuracyMeter({ 
  percentage, 
  className = '',
  variant = 'default' // 'default' or 'detail'
}) {
  const getColor = (percent) => {
    if (percent <= 50) return 'bg-red-500';
    if (percent <= 69) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLabel = (percent) => {
    if (percent <= 50) return 'Unreliable';
    if (percent <= 69) return 'Questionable';
    return 'Reliable';
  };

  if (variant === 'detail') {
    return (
      <div className={`w-full sm:w-[180px] ${className}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Accuracy: {percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className={`h-2.5 rounded-full ${getColor(percentage)}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-left">
          <span className={`text-xs font-medium ${getColor(percentage).replace('bg', 'text')}`}>
            {getLabel(percentage)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
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