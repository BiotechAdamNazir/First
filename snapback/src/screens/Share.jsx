import { useEffect, useState } from 'react';
import { keep } from '../lib/selection';

// Where a sentence came from, guessed from whatever the sharing app told us.
// The address is the reliable signal; some apps staple it into the text
// instead of the url field, so all three are searched for it. The title is
// checked separately, because an app that shares no address at all often
// names itself there.
function inferSource({ title, url, text }) {
  const all = `${title} ${url} ${text}`.toLowerCase();
  const named = title.trim().toLowerCase();

  if (all.includes('claude.ai') || named === 'claude') return 'claude';
  if (all.includes('chatgpt.com') || all.includes('chat.openai.com') || named === 'chatgpt') {
    return 'chatgpt';
  }
  return 'self';
}

// Android apps often staple the page address onto the end of the shared text.
function stripTrailingUrl(text) {
  const trimmed = text.trim();
  const withoutUrl = trimmed.replace(/\s*https?:\/\/\S+\s*$/i, '').trim();
  return withoutUrl || trimmed;
}

export default function Share({ navigate }) {
  const [phase, setPhase] = useState('keeping'); // keeping | kept | held | nothing | trouble

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || '';
    const url = params.get('url') || '';
    const text = params.get('text') || '';

    const body = stripTrailingUrl(text) || title.trim();

    if (!body) {
      setPhase('nothing');
      return;
    }

    let live = true;
    keep(body, inferSource({ title, url, text }))
      .then((outcome) => live && setPhase(outcome))
      .catch((error) => {
        console.error(error);
        if (live) setPhase('trouble');
      });

    return () => {
      live = false;
    };
  }, []);

  // Step out of the way once the work is done. A window the app did not open
  // itself usually refuses to close, so falling back to the return screen
  // keeps the app in a sensible place either way.
  useEffect(() => {
    if (phase === 'keeping') return;
    const timer = setTimeout(() => {
      window.close();
      navigate('/', { replace: true });
    }, phase === 'kept' ? 1100 : 2200); // longer words get longer to be read
    return () => clearTimeout(timer);
  }, [phase, navigate]);

  const words = {
    keeping: '',
    kept: 'kept',
    held: 'kept for when there is signal',
    nothing: 'nothing to keep',
    trouble: 'could not keep that',
  };

  return (
    <div className="screen">
      <div className="stage">
        {phase !== 'keeping' && <p className="murmur fade">{words[phase]}</p>}
      </div>
    </div>
  );
}
