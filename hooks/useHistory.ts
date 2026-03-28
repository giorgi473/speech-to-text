import { useRecords } from "@/app/RecordContext";

export const useHistory = () => {
  const { records, deleteRecord } = useRecords();

  return {
    records,
    deleteRecord,
  };
};
