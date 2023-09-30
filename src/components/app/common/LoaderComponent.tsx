export default function LoaderComponent() {
  return (
    <>
      <div className="absolute inset-0 bg-background flex items-center justify-center p-5">
          <div className={"flex flex-col align-middle items-center "}>
              <div className="flex space-x-2 animate-pulse mb-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div>⚡️ I know</div>
          </div>

      </div>
    </>
  );
}
