import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-[#1e293b]/50 border border-white/5 p-8 rounded-[2rem] space-y-6">
    <div className="flex items-center gap-5">
      <Skeleton className="w-16 h-16 rounded-2xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 px-8 py-5 border-b border-white/5">
    <Skeleton className="w-10 h-10 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-3 w-1/6" />
    </div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
  </div>
);

export default Skeleton;
