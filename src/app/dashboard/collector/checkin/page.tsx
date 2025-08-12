import CheckInPanel from "@/components/dashboard/collector/checkin/CheckInPanel";
import { PermissionGuard } from "@/components/dashboard/collector/checkin/PermissionGuard";

export default function CollectorCheckInPage() {
  return (
    <PermissionGuard requireCamera={true} requireGeolocation={true}>
      <div className="p-4">
        <CheckInPanel />
      </div>
    </PermissionGuard>
  );
}
