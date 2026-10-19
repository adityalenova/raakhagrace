import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback")({ component: () => <Navigate to="/login" /> });
