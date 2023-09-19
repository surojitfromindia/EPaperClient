export default function LoaderComponent() {
  return (
    <>
      <div className="absolute h-full w-full bg-primary-foreground flex items-center justify-center p-5">
        <div className="flex space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-primary rounded-full"></div>
        </div>
      </div>
    </>
  );
}
