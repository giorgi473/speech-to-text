import React, { createContext, useContext, useState } from "react";

export type RecordItem = {
  id: number;
  text: string;
  date: string;
  duration: string;
};

type RecordContextType = {
  records: RecordItem[];
  addRecord: (item: Omit<RecordItem, "id">) => RecordItem;
};

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export function RecordProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<RecordItem[]>([]);

  const addRecord = (item: Omit<RecordItem, "id">) => {
    const newRecord: RecordItem = { id: Date.now(), ...item };
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  return (
    <RecordContext.Provider value={{ records, addRecord }}>
      {children}
    </RecordContext.Provider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordContext);
  if (!ctx) {
    throw new Error("useRecords must be used inside RecordProvider");
  }
  return ctx;
}
