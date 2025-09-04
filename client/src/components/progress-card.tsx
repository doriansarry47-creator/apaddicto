import { cn } from "@/lib/utils";

interface ProgressCardProps {
  value: number;
  label: string;
  icon: string;
  className?: string;
  testId?: string;
}

export default function ProgressCard({ value, label, icon, className, testId }: ProgressCardProps) {
  return (
    <div className={cn("rounded-2xl p-4 text-white", className)} data-testid={testId}>
      <div className="text-2xl font-bold mb-1" data-testid={`${testId}-value`}>
        {value}
      </div>
      <div className="text-sm opacity-90" data-testid={`${testId}-label`}>
        {label}
      </div>
      <div className="mt-2">
        <i className={`fas fa-${icon} text-sm opacity-75`}></i>
      </div>
    </div>
  );
}
