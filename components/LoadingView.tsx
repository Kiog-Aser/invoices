import React from "react";

export default function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading loading-spinner loading-lg text-primary"></div>
    </div>
  );
}