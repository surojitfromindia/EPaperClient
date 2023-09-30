export default function LoaderComponent() {
  return (
    <>
      <div className="absolute inset-0  flex items-center justify-center p-5">
        <div className="flex space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
        </div>
      </div>
    </>
  );
}
