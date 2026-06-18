const LoadingGrid = ({ count = 12, type = 'channel' }) => (
  <div className={`grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl overflow-hidden">
        <div className={`${type === 'channel' ? 'aspect-video' : 'aspect-[2/3]'} animate-shimmer rounded-xl`} />
        <div className="p-2.5 space-y-2 mt-2">
          <div className="h-3 rounded-full animate-shimmer w-3/4" />
          <div className="h-2 rounded-full animate-shimmer w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingGrid;
