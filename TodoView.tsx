import { useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function TodoView() {
  return (
    <DashboardLayout>
      <div className="text-center py-10">
        <p>Please use Todo Setup to view details.</p>
      </div>
    </DashboardLayout>
  );
}
