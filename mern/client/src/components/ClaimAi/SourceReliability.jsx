export function categorizeSource(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const domain = new URL(formattedUrl).hostname.replace('www.', '');

    const reliableDomains = [
      'bipm.org', 'nist.gov', 'royalsociety.org', 
      'nasa.gov', 'nature.com', 'science.org',
      'arxiv.org', 'nih.gov', 'who.int', 'cdc.gov',
      'reuters.com', 'apnews.com', 'nytimes.com',
      'bbc.com', 'cnn.com', 'nejm.org', 'thelancet.com',
      'jamanetwork.com', 'heart.org', 'nhlbi.nih.gov',
      'mayoclinic.org', 'hopkinsmedicine.org',
    ];

    const unreliablePatterns = [
      'blogspot.com', 'wordpress.com', 
      'medium.com', 'tumblr.com',
      /\.blog\b/i, /\bblog\./i, /\.wordpress\./i
    ];

    const zeroScoreSources = [
      'reddit.com', 'quora.com', '4chan.org', '8kun.top', 'discord.com', 'tapatalk.com', 'stackexchange.com',
    ];

    if (reliableDomains.some(d => domain.includes(d))) return 'reliable';
    if (zeroScoreSources.some(d => domain.includes(d))) return 'unreliable'; // treat as noise
    if (unreliablePatterns.some(d =>
      typeof d === 'string' ? domain.includes(d) : d.test(domain)
    )) return 'unreliable';

    if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 'reliable';
    if (domain.includes('blog') || domain.includes('opinion')) return 'unreliable';

    return 'unknown';
  } catch {
    return null;
  }
}



export function SourceReliability({ sources }) {
  const parseSources = () => {
    if (!sources) return [];

    if (Array.isArray(sources)) {
      return sources
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    if (typeof sources === "string") {
      return sources
        .split(/\s+|\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    return [];
  };

  const sourceList = parseSources();

  if (sourceList.length === 0) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Source Reliability Analysis</h4>
        <p className="text-sm text-gray-500">
          {!sources ? "No sources provided." : "No valid sources detected."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Source Reliability Analysis</h4>
      <ul className="space-y-2">
        {sourceList.map((source, index) => {
          const type = categorizeSource(source);

          const colorClass =
            type === "reliable" ? "bg-green-500" :
            type === "unreliable" ? "bg-red-500" :
            "bg-gray-400";

          const label =
            type === "reliable" ? "Reliable source" :
            type === "unreliable" ? "Unreliable source" :
            "Unknown source";

          return (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${colorClass}`}
                title={label}
              ></div>
              <a
                href={source.startsWith("http") ? source : `https://${source}`}
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
