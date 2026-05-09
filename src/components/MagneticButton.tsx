import { ReactNode, useRef, MouseEvent, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  style?: CSSProperties;
  onClick?: () => void;
  as?: "button" | "a" | "div";
  href?: string;
}

const MagneticButton = ({
  children,
  className = "",
  strength = 0.35,
  style,
  onClick,
  as = "div",
  href,
}: Props) => {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0,0)";
  };

  const Tag: any = as;
  return (
    <Tag
      ref={ref as any}
      href={href}
      onClick={onClick}
      onMouseMove={onMove as any}
      onMouseLeave={onLeave}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
};

export default MagneticButton;