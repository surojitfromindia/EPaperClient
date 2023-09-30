export default function LoaderFullPage() {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-5 bg-accent-muted absolute inset-0 z-40 min-w-screen">
        <div className={"flex flex-col align-middle items-center "}>
          <div className="flex space-x-2 animate-pulse mb-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <div>🚀 Not Very Fast. Please wait</div>
        </div>
      </div>
    </>
  );
}
