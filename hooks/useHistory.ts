import { useRecords } from "@/contexts/RecordContext";

export const useHistory = () => {
  const { records, deleteRecord } = useRecords();

  return {
    records,
    deleteRecord,
  };
};
