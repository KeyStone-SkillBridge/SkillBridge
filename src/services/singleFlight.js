import { useCallback, useRef } from "react";

import { log } from "./logger";

// ===========================================================================
// Submit lock. Wrap a handler that sends something to the server:
//
//   const handleVerify = useSingleFlight(async () => { ... });
//
// While one call is still running, further calls are ignored. This is stronger
// than a `loading` state flag: state only updates on the next render, so two
// quick taps can both get through before the button is disabled.
// ===========================================================================
export function useSingleFlight(handler, label = "handler") {
  const running = useRef(false);

  return useCallback(
    async (...args) => {
      if (running.current) {
        log("singleFlight", `Ignored a repeat call to ${label} while one is still running`);
        return undefined;
      }
      running.current = true;
      try {
        return await handler(...args);
      } finally {
        running.current = false;
      }
    },
    [handler, label],
  );
}
