import React from "react";
import ServerError from "@/pages/system/ServerError";

type State = { hasError: boolean; error?: Error };

export default class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Tu peux logger à distance ici si besoin
    console.error("AppErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ServerError error={this.state.error} />;
    }
    return this.props.children;
  }
}
