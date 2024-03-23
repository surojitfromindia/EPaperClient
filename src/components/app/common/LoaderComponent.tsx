import EPaperLogo from "./EpaperLogo";

export default function LoaderComponent({ mText = "Fetching you data" }) {
  return (
    <>
      <div className="absolute inset-0 bg-background flex items-center justify-center">
        <div className={"flex flex-col align-middle items-center "}>
          <div className="flex space-x-2 animate-pulse mb-3">
            <EPaperLogo className="text-primary"/>
          </div>
          <div className="text-muted-foreground">{mText}</div>
        </div>
      </div>
    </>
  );
}
