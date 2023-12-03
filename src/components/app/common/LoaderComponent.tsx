export default function LoaderComponent({ mText = "️⚡️I know" }) {
  return (
    <>
      <div className="absolute inset-0 bg-background flex items-center justify-center">
        <div className={"flex flex-col align-middle items-center "}>
          <div className="flex space-x-2 animate-pulse mb-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <div>{mText}</div>
        </div>
      </div>
    </>
  );
}
