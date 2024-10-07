import { useEffect } from "react";

import { BareMuxConnection } from "@mercuryworkshop/bare-mux";
import { useSettings } from "../../store";
declare global {
  interface Window {
    Connection: BareMuxConnection;
  }
}

const useSw = (path: string) => {
  const settingsStore = useSettings();
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((_registration) => {
        const connection = new BareMuxConnection("/baremux/worker.js");
        window.Connection = connection;
        console.log(settingsStore.transport.path);
        connection.setTransport(settingsStore.transport.path, [
          {
            wisp: `${location.protocol.includes("https") ? "wss://" : "ws://"}${
              location.host
            }/w/`,
          },
        ]);
        // console.log("sending", JSON.stringify(pluginStore.plugins));
        // registration.active?.postMessage(JSON.stringify(pluginStore.plugins));
      });
      navigator.serviceWorker.register(path).then(
        function (registration) {
          console.log(
            `[sw] ${path} successfuly registered with a scope of ${registration.scope}`
          );
        },
        function (err) {
          console.log(
            `%c[sw] ${path} failed to register, error: `,
            "color:red;",
            err
          );
        }
      );
    }
  }, [path]);
};

export default useSw;
