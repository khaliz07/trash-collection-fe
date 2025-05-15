"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Camera, CheckCircle, AlertCircle } from "lucide-react"

export default function CheckinPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  
  const handleCheckin = async () => {
    setIsLoading(true)
    
    // Simulating check-in process
    setTimeout(() => {
      setStatus("success")
      setIsLoading(false)
    }, 2000)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Collection Check-in</h2>
        <p className="text-muted-foreground">
          Complete your check-in for the current collection point
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
            <CardDescription>
              Verify your location matches the collection point
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">123 Oak Street, Springfield</p>
                <p className="text-sm text-muted-foreground">Collection Point #A123</p>
              </div>
              <Button variant="outline" size="sm">
                Refresh GPS
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Collection Verification</CardTitle>
            <CardDescription>
              Take a photo to verify the collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="photo">Collection Photo</Label>
                  <Input 
                    id="photo" 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Input 
                    id="notes" 
                    placeholder="Enter any additional notes about the collection" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {status === "success" && (
          <Card className="border-emerald-500/50 bg-emerald-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-emerald-500">Check-in Successful</p>
                  <p className="text-sm text-emerald-500/80">Collection point verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {status === "error" && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-destructive">Check-in Failed</p>
                  <p className="text-sm text-destructive/80">Please try again</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Button 
          className="w-full" 
          size="lg"
          disabled={isLoading || status === "success"} 
          onClick={handleCheckin}
        >
          {isLoading ? "Checking in..." : "Complete Check-in"}
        </Button>
      </div>
    </div>
  )
}