import React, { createContext, useContext, useState } from "react";

const ViewToggleContext = createContext();

export function ViewToggleProvider({ children }) {
  const [showPending, setShowPending] = useState(false);

  const toggleView = () => {
    setShowPending((prev) => !prev);
  };

  return (
    <ViewToggleContext.Provider value={{ showPending, toggleView }}>
      {children}
    </ViewToggleContext.Provider>
  );
}

export function useViewToggle() {
  return useContext(ViewToggleContext);
}
