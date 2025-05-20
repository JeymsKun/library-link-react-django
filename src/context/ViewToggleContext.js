import React, { createContext, useContext, useState } from "react";

const ViewToggleContext = createContext();

export function ViewToggleProvider({ children }) {
  const [showPending, setShowPending] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const toggleView = () => {
    setShowPending((prev) => !prev);
  };

  const toggleFavorites = () => setShowFavorites(!showFavorites);

  return (
    <ViewToggleContext.Provider
      value={{ showPending, toggleView, showFavorites, toggleFavorites }}
    >
      {children}
    </ViewToggleContext.Provider>
  );
}

export function useViewToggle() {
  return useContext(ViewToggleContext);
}
