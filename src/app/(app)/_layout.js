import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
