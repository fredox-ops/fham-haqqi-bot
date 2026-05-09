import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteFade = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [key, setKey] = useState(pathname);
  useEffect(() => { setKey(pathname); }, [pathname]);
  return <div key={key} className="animate-fade-up">{children}</div>;
};

export default RouteFade;
