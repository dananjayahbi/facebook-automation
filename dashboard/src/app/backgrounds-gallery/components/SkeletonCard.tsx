interface SkeletonCardProps {
  index: number;
}

export default function SkeletonCard({ index }: SkeletonCardProps) {
  // Use a pattern of fixed heights to avoid hydration mismatch
  const heights = [300, 250, 350, 280, 320, 270, 340, 290, 310, 260];
  const height = heights[index % heights.length];

  return (
    <div className="mb-4 bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Skeleton Image - fixed height pattern */}
      <div 
        className="w-full bg-gray-200" 
        style={{ height: `${height}px` }}
      />

      {/* Skeleton Info */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}
