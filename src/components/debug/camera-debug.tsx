"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CameraDebug() {
  const { permissions, requestCameraPermission } = usePermissions();
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  const testCameraAccess = async () => {
    try {
      console.log("🔍 Testing camera access...");
      
      // Kiểm tra API support
      const hasMediaDevices = !!navigator.mediaDevices;
      const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;
      
      setDebugInfo({
        hasMediaDevices,
        hasGetUserMedia,
        userAgent: navigator.userAgent,
        permissions: permissions,
        timestamp: new Date().toISOString()
      });

      if (!hasGetUserMedia) {
        console.error("❌ getUserMedia not supported");
        return;
      }

      // Thử access camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      
      console.log("✅ Camera stream:", stream);
      
      // Stop stream
      stream.getTracks().forEach(track => track.stop());
      
      setDebugInfo(prev => ({
        ...prev,
        cameraAccess: "success",
        streamTracks: stream.getTracks().length
      }));
      
    } catch (error: any) {
      console.error("❌ Camera test failed:", error);
      setDebugInfo(prev => ({
        ...prev,
        cameraAccess: "failed",
        error: error.message,
        errorName: error.name
      }));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔍 Camera Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={requestCameraPermission} variant="outline">
            📱 Request Camera Permission
          </Button>
          <Button onClick={testCameraAccess} variant="outline">
            🎥 Test Camera Access
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📊 Permission Status:</h3>
          <pre className="text-sm">
            Camera: {permissions.camera || "unknown"}
            {"\n"}GPS: {permissions.geolocation || "unknown"}
          </pre>
        </div>

        {Object.keys(debugInfo).length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>📱 Mobile Chrome:</strong> Permission dialog should auto-appear</p>
          <p><strong>🔒 Desktop:</strong> Click address bar icon to allow camera</p>
          <p><strong>⚡ Debug:</strong> Check console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
}
