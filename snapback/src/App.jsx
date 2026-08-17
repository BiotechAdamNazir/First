import { useCallback, useEffect, useState } from 'react';
import Return from './screens/Return';
import Snap from './screens/Snap';
import Share from './screens/Share';

// Three screens, no router library. The share target lands on /share, the
// writing screen on /snap, and everything else is the return.
export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    if (options.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setPath(to);
  }, []);

  if (path.startsWith('/share')) return <Share navigate={navigate} />;
  if (path.startsWith('/snap')) return <Snap navigate={navigate} />;
  return <Return navigate={navigate} />;
}
