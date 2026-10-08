import { useEffect, useState } from "react";
import { resolveFileUrl } from "@/lib/db";

export function useResolvedFileUrl(pathOrUrl?: string | null) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    if (!pathOrUrl) {
      setUrl("");
      return;
    }
    if (/^https?:\/\//.test(pathOrUrl) || pathOrUrl.startsWith("data:") || pathOrUrl.startsWith("blob:")) {
      setUrl(pathOrUrl);
      return;
    }
    resolveFileUrl(pathOrUrl)
      .then((res) => {
        if (active) setUrl(res);
      })
      .catch(() => {
        if (active) setUrl("");
      });

    return () => {
      active = false;
    };
  }, [pathOrUrl]);

  return url;
}
