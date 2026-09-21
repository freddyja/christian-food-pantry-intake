import { useEffect, useState } from "react";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("pantry_install_tip") === "hide") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-10 rounded-2xl border border-forest/20 bg-leaf/80 px-4 py-4 text-base text-forest-dark">
      <p className="font-semibold">Install on this tablet</p>
      <p className="mt-1">
        Add to Home Screen so check-in opens like an app and keeps working offline. Data stays in this
        device’s browser (IndexedDB) — export a backup from Admin if you switch tablets.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <strong>iPad / iPhone:</strong> Share → Add to Home Screen
        </li>
        <li>
          <strong>Android / Chrome:</strong> menu → Install app / Add to Home screen
        </li>
      </ul>
      <button
        type="button"
        className="mt-3 text-lg font-semibold text-forest underline"
        onClick={() => {
          sessionStorage.setItem("pantry_install_tip", "hide");
          setVisible(false);
        }}
      >
        Hide for now
      </button>
    </div>
  );
}
