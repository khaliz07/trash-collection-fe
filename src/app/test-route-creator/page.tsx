"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OptimizedRouteCreator from "@/components/admin/schedules/OptimizedRouteCreator";

export default function TestRouteCreator() {
  const [showCreator, setShowCreator] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Optimized Route Creator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Test the new optimized route creator with fixed map and scrollable
            lists.
          </p>

          <Button onClick={() => setShowCreator(!showCreator)} size="lg">
            {showCreator ? "Ẩn" : "Hiển thị"} Route Creator
          </Button>

          {showCreator && (
            <div className="mt-6 border rounded-lg p-6 bg-gray-50">
              <OptimizedRouteCreator
                onRouteCreated={(route) => {
                  console.log("Route created:", route);
                  alert("Route created successfully!");
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
