import React from "react";

export default function FormPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen items-center justify-center -mt-10">
        {children}
    </div>
  );
}
