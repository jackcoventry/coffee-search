type RatingProps = {
  label?: string;
  value: number;
};

export function Scale({ label = 'Rating', value }: Readonly<RatingProps>) {
  const clampedValue = Math.min(Math.max(value, 0), 5);

  return (
    <div
      className="flex gap-6"
      role="img"
      aria-label={`${label}: ${clampedValue} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fillAmount = Math.min(Math.max(value - i, 0), 1);

        return (
          <div
            key={i}
            aria-hidden="true"
            className="w-5 h-5 rounded-full relative overflow-hidden bg-white border-2 border-black"
          >
            <div
              className="h-full bg-black"
              style={{
                width: `${fillAmount * 100}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
