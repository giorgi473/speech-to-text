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
  deleteRecord: (id: number) => void;
};

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export function RecordProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<RecordItem[]>([]);

  const addRecord = (item: Omit<RecordItem, "id">) => {
    const newRecord: RecordItem = { id: Date.now(), ...item };
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteRecord = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RecordContext.Provider value={{ records, addRecord, deleteRecord }}>
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
