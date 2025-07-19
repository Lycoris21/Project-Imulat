export function categorizeSource(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Normalize URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    const domain = new URL(formattedUrl).hostname.replace('www.', '');
    
    // Expanded reliable sources list
    const reliable = [
      'bipm.org', 'nist.gov', 'royalsociety.org', 
      'nasa.gov', 'nature.com', 'science.org',
      'arxiv.org', 'nih.gov', 'who.int', 'cdc.gov',
      'reuters.com', 'apnews.com', 'nytimes.com',
      'bbc.com', 'cnn.com'
    ];
    
    // More comprehensive unreliable patterns
    const unreliable = [
      'blogspot.com', 'wordpress.com', 
      'medium.com', 'tumblr.com',
      /\.blog\b/i, /\bblog\./i, /\.wordpress\./i
    ];
    
    if (reliable.some(d => domain.includes(d))) return 'reliable';
    if (unreliable.some(d => 
      typeof d === 'string' ? domain.includes(d) : d.test(domain)
    )) return 'unreliable';
    
    return 'unknown';
  } catch {
    return null;
  }
}

export function SourceReliability({ sources }) {
  // Debug output
  console.log('[SourceReliability] Received sources:', sources);
  
  // Handle edge cases more robustly
  const parsedSources = () => {
    if (!sources) return [];
    
    // Handle both string and array inputs
    if (Array.isArray(sources)) {
      return sources.filter(s => s && typeof s === 'string' && s.trim().length > 0);
    }
    
    if (typeof sources === 'string') {
      return sources.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    return [];
  };

  const sourceList = parsedSources();
  console.log('[SourceReliability] Processed sources:', sourceList);

  if (sourceList.length === 0) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Source Reliability Analysis</h4>
        <p className="text-sm text-gray-500">
          {!sources ? "No sources provided" : "No valid sources detected"}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Source Reliability Analysis</h4>
      <ul className="space-y-1">
        {sourceList.map((source, i) => {
          const type = categorizeSource(source);
          const bgColor = type === 'reliable' ? 'bg-green-500' : 
                         type === 'unreliable' ? 'bg-red-500' : 'bg-gray-500';
          
          return (
            <li key={i} className="flex items-center text-sm">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${bgColor}`}></span>
              <a 
                href={source.startsWith('http') ? source : `https://${source}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {source}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}