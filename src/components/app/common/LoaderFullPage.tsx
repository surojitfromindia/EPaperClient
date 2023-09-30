export default function LoaderFullPage() {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-5 bg-accent-muted absolute inset-0 z-40 min-w-screen">
        <div className="flex space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
        </div>
      </div>
    </>
  );
}
