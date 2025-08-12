import React from 'react';

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // utile pour Sentry plus tard
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#fff" }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Une erreur est survenue</h1>
          <pre style={{
            whiteSpace: "pre-wrap",
            background: "#1a1a1f",
            border: "1px solid #2a2a30",
            borderRadius: 8,
            padding: 12,
            overflow: "auto"
          }}>
{String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
