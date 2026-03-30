import { useRecords } from "@/context/RecordContext";

export const useHistory = () => {
  const { records, deleteRecord } = useRecords();

  return {
    records,
    deleteRecord,
  };
};
