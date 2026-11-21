import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [points, setPoints] = useState(999999);
  const [recycledCount, setRecycledCount] = useState(12);
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [productData, setProductData] = useState(null);

  const addPoints = (amount) => {
    setPoints((prev) => prev + amount);
    setRecycledCount((prev) => prev + 1);
  };

  const deductPoints = (amount) => {
    if (points >= amount) {
      setPoints((prev) => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <UserContext.Provider
      value={{
        points,
        recycledCount,
        currentScreen,
        setCurrentScreen,
        productData,
        setProductData,
        addPoints,
        deductPoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
