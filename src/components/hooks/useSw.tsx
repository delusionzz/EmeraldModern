import { useEffect } from "react";
import { VERSION } from "@/constants";
import { BareMuxConnection } from "@mercuryworkshop/bare-mux";
import { useSettings } from "../../store";
import { log } from "@/lib/utils";
declare global {
  interface Window {
    Connection: BareMuxConnection;
    sj: {
      init: (path: string) => Promise<ServiceWorkerRegistration>;
      // fix
      createFrame: (frame?: HTMLIFrameElement) => void;
      encodeUrl: (url: string | URL) => string;
      saveConfig: () => void;
      //fix
      modifyConfig: () => void;
    };
  }
}

const useSw = (path: string, scope: string = "/") => {
  const settingsStore = useSettings();
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (window.sj) {
        window.sj.init(path);
        navigator.serviceWorker
          .register(`./sw.js?v=${VERSION}`, { scope })
          .then(
            function (registration) {
              log.info(
                `[sw] ${path} successfuly registered with a scope of ${registration.scope}`
              );
            },
            function (err) {
              log.error(`[sw] ${path} failed to register, error: `, err);
            }
          );
      }
      navigator.serviceWorker.ready.then(() => {
        const connection = new BareMuxConnection("/baremux/worker.js");
        window.Connection = connection;
        log.info(
          `Setting wisp url to ${settingsStore.wispUrl} and using the transport ${settingsStore.transport.name} (${settingsStore.transport.path})`
        );
        connection.setTransport(settingsStore.transport.path, [
          {
            wisp: settingsStore.wispUrl,
          },
        ]);
      });
    }
  }, [path]);
};

export default useSw;
