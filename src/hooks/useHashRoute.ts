import { useState, useEffect, useCallback } from "react";

type Route = "shiki-editor" | "textarea" | "monaco" | "codemirror";

function getRoute(): Route {
  const hash = window.location.hash.replace("#/", "");
  if (hash === "textarea") return "textarea";
  if (hash === "monaco") return "monaco";
  if (hash === "codemirror") return "codemirror";
  return "shiki-editor";
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((to: Route) => {
    window.location.hash = `#/${to}`;
  }, []);

  return { route, navigate };
}
