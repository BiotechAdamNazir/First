import { useState } from 'react';
import { keep } from '../lib/selection';
import { offerNotifications } from '../lib/notify';

export default function Snap({ navigate }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [refused, setRefused] = useState(false);

  async function submit() {
    if (busy || !text.trim()) return;
    setBusy(true);
    offerNotifications();
    try {
      // Saved or held for later, either way the sentence is safe.
      await keep(text, 'self');
      navigate('/');
    } catch (error) {
      console.error(error);
      setRefused(true);
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div className="compose">
        <textarea
          className="field"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          autoFocus
          spellCheck="false"
          aria-label="A sentence"
        />
      </div>
      <button className="keep" onClick={submit} disabled={busy || !text.trim()}>
        {refused ? 'Could not keep — try again' : 'Keep'}
      </button>
    </div>
  );
}
