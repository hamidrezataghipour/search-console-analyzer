import { useState, useEffect, useRef, ReactNode } from "react";

interface ChartWrapperProps {
  children: ReactNode;
  height?: number;
}

/**
 * ChartWrapper ensures Recharts is only rendered when of non-zero width.
 * This completely avoids Recharts "-1 width" errors occurring inside
 * toggled menus or accordions.
 */
export default function ChartWrapper({ children, height = 300 }: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
          setReady(true);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", minWidth: 0, height: height }}>
      {ready && containerWidth > 0 ? (
        children
      ) : (
        <div
          style={{
            width: "100%",
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            fontSize: "13px",
          }}
        >
          در حال بارگذاری نمودار...
        </div>
      )}
    </div>
  );
}
