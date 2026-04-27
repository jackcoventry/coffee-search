import './TextMarquee.css';

type Props = {
  children: React.ReactNode;
  height?: number;
};

export function TextMarquee({ children, height }: Readonly<Props>) {
  const repeats = 10;

  return (
    <div
      className="text-marquee | overflow-hidden whitespace-nowrap relative w-full opacity-10 [-webkit-text-size-adjust:100%]"
      style={height ? { height } : undefined}
      aria-hidden="true"
    >
      <div className="absolute left-0 top-0 inline-flex w-max transform-[translate3d(0,0,0)] backface-hidden will-change-transform animate-marquee-a">
        {Array.from({ length: repeats }).map((_, i) => (
          <span
            key={i}
            className="font-mega uppercase inline-block flex-none mr-8"
          >
            {children}
          </span>
        ))}
      </div>

      <div className="absolute left-0 top-0 inline-flex w-max transform-[translate3d(0,0,0)] backface-hidden will-change-transform animate-marquee-b">
        {Array.from({ length: repeats }).map((_, i) => (
          <span
            key={`b-${i}`}
            className="font-mega uppercase inline-block flex-none mr-8"
          >
            {children}
          </span>
        ))}
      </div>

      <span className="invisible">
        {Array.from({ length: 2 }).map((_, i) => (
          <span
            key={i}
            className="font-mega uppercase mr-8"
          >
            {children}
          </span>
        ))}
      </span>
    </div>
  );
}
