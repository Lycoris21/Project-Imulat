export const parseLinks = (text) => {
  if (!text) return text;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split('\n').map((line, i) => (
    <div key={i}>
      {line.split(urlRegex).map((part, j) => (
        urlRegex.test(part) ? (
          <a 
            key={j} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {part}
          </a>
        ) : (
          part
        )
      ))}
    </div>
  ));
};