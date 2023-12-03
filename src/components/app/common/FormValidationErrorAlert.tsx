import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { XCircle } from "lucide-react";

function FormValidationErrorAlert({ messages }) {
  const hasError = messages.length > 0;
  if (!hasError) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>
        <ul className="list-disc list-inside">
          {messages.map((message: string, index: number) => (
            <li key={index} className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export { FormValidationErrorAlert };
