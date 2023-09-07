import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InternetStatus() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className={"text-destructive"}>Heads up!</AlertTitle>
      <AlertDescription>
        Looks like you are not connected to internet
      </AlertDescription>
    </Alert>
  );
}
