import { useCallback } from "react";

const useScrollToHash = () => {
  return useCallback((elementId: string, offset: number = 100) => {
    const scroll = () => {
      const element = document.getElementById(elementId);
      if (!element) {
        return;
      }

      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element!.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scroll);
    });
  }, []);
};

export { useScrollToHash };
