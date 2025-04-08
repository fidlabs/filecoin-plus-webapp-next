import { useEffect, useRef, useState } from "react";

const useScrollObserver = () => {
  const [top, setTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref?.current) {
        setTop(ref.current.getBoundingClientRect().top);
      }
    };

    window.addEventListener("resize", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [ref]);

  return { top, ref };
};

export { useScrollObserver };
