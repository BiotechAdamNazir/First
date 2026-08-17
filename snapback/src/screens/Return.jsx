import { useEffect, useState } from 'react';
import { configured } from '../lib/supabase';
import { tonight, landed, hasResponded, markResponded } from '../lib/selection';
import { offerNotifications } from '../lib/notify';
import Mark from '../components/Mark';

export default function Return({ navigate }) {
  // waiting | reading | quiet | empty | trouble
  const [phase, setPhase] = useState('waiting');
  const [snap, setSnap] = useState(null);
  const [anniversary, setAnniversary] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) {
      setPhase('trouble');
      return;
    }

    if (hasResponded()) {
      setPhase('quiet');
      return;
    }

    let live = true;
    tonight()
      .then(({ snap: chosen, anniversary: isAnniversary }) => {
        if (!live) return;
        if (!chosen) {
          setPhase('empty');
          return;
        }
        setSnap(chosen);
        setAnniversary(isAnniversary);
        setPhase('reading');
      })
      .catch((error) => {
        console.error(error);
        if (live) setPhase('trouble');
      });

    return () => {
      live = false;
    };
  }, []);

  async function answer(didLand) {
    if (busy) return;
    setBusy(true);
    offerNotifications();
    try {
      if (didLand) await landed(snap);
    } catch (error) {
      console.error(error);
    }
    markResponded();
    setPhase('quiet');
  }

  return (
    <div className="screen">
      <Mark onClick={() => navigate('/snap')} />

      {phase === 'waiting' && <div className="stage" />}

      {phase === 'reading' && (
        <>
          <div className="stage">
            <p className="sentence fade">{snap.text}</p>
            {anniversary && (
              <p className="anniversary fade-slow">you wrote this a year ago tonight</p>
            )}
          </div>
          <div className="answers fade-slow">
            <button className="answer" onClick={() => answer(true)} disabled={busy}>
              Landed
            </button>
            <button className="answer" onClick={() => answer(false)} disabled={busy}>
              Not tonight
            </button>
          </div>
        </>
      )}

      {phase === 'quiet' && (
        <div className="stage">
          <div className="rule fade" />
        </div>
      )}

      {phase === 'empty' && (
        <div className="stage">
          <p className="murmur fade">nothing kept yet</p>
        </div>
      )}

      {phase === 'trouble' && (
        <div className="stage">
          <p className="trouble fade">
            {configured
              ? 'Could not reach the collection tonight.'
              : 'Not connected yet — VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.'}
          </p>
        </div>
      )}
    </div>
  );
}
