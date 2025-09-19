import { AIUsageIndicator } from '../AIUsageIndicator';

export default function AIUsageIndicatorExample() {
  return (
    <div className="p-4 max-w-md">
      <AIUsageIndicator
        currentUsage={23}
        maxUsage={50}
        unit="peças"
      />
    </div>
  );
}