import { User } from "@/types";
import React, { createContext, ReactNode, useContext } from "react";
import { getCurrentUser } from "./api";
import { useAppwrite } from "./useAppwrite";

interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite<User, {}>({
    fn: getCurrentUser,
  });

  const isLoggedIn = !!user;

  console.log("🌍 Global Context:", { isLoggedIn, user, loading });

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        refetch: async () => {
          await refetch({});
        },
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

export default GlobalProvider;
