const dotColors: Record<string, string> = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
  orange: 'bg-orange-500',
};

export function StatusDot({ color = 'gray', pulse }: { color?: string; pulse?: boolean }) {
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[color] ?? dotColors.gray} ${pulse ? 'animate-pulse' : ''}`} />
  );
}
