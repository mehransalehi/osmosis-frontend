import { createContext, ReactNode, useContext } from "react";

interface AdminLanguageContextProps {
  lang: string;
  setLang: (lang: string) => void;
}

// Create context
const AdminLanguageContext = createContext<AdminLanguageContextProps>({
  lang: "en",
  setLang: () => {},
});

// Custom hook for children
export const useAdminLanguage = () => useContext(AdminLanguageContext);

// Provider component
interface AdminLanguageProviderProps {
  lang: string;
  setLang: (lang: string) => void;
  children: ReactNode;
}

export const AdminLanguageProvider = ({
  lang,
  setLang,
  children,
}: AdminLanguageProviderProps) => {
  return (
    <AdminLanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </AdminLanguageContext.Provider>
  );
};
