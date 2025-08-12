"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";

export function PermissionDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const { permissions } = usePermissions();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  const checkDeviceInfo = () => {
    addLog("📱 Device Info:");
    addLog(`- User Agent: ${navigator.userAgent}`);
    addLog(`- Platform: ${navigator.platform}`);
    addLog(`- Language: ${navigator.language}`);
    addLog(`- Online: ${navigator.onLine}`);

    if ("permissions" in navigator) {
      addLog("✅ Permissions API supported");
    } else {
      addLog("❌ Permissions API not supported");
    }

    if ("mediaDevices" in navigator) {
      addLog("✅ MediaDevices API supported");
    } else {
      addLog("❌ MediaDevices API not supported");
    }

    if ("geolocation" in navigator) {
      addLog("✅ Geolocation API supported");
    } else {
      addLog("❌ Geolocation API not supported");
    }
  };

  return (
    <Card className="p-4 m-4 max-w-md">
      <h3 className="font-bold mb-4">🔧 Permission Debugger</h3>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Camera:</strong> {permissions.camera || "unknown"}
        </div>
        <div className="text-sm">
          <strong>GPS:</strong> {permissions.geolocation || "unknown"}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Button
          onClick={testCameraPermission}
          className="w-full text-xs"
          size="sm"
        >
          📷 Test Camera Permission
        </Button>
        <Button
          onClick={testGPSPermission}
          className="w-full text-xs"
          size="sm"
        >
          📍 Test GPS Permission
        </Button>
        <Button
          onClick={checkDeviceInfo}
          className="w-full text-xs"
          size="sm"
          variant="outline"
        >
          📱 Check Device Info
        </Button>
        <Button
          onClick={() => setLogs([])}
          className="w-full text-xs"
          size="sm"
          variant="destructive"
        >
          🗑️ Clear Logs
        </Button>
      </div>

      <div className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-y-auto">
        <div className="font-mono">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
