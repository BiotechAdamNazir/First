import { useState } from 'react';
import { save } from '../lib/selection';
import { offerNotifications } from '../lib/notify';

export default function Snap({ navigate }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function keep() {
    if (busy || !text.trim()) return;
    setBusy(true);
    offerNotifications();
    try {
      await save(text, 'self');
      navigate('/');
    } catch (error) {
      console.error(error);
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
      <button className="keep" onClick={keep} disabled={busy || !text.trim()}>
        Keep
      </button>
    </div>
  );
}
