"use client";
import { useState } from 'react';
import { CheckInData, CheckInConfig } from './types';
import { mockCheckInData, mockCheckInConfig } from './mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ImagePreview } from '@/components/ui/image-preview';

function getCurrentTimeString() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CheckInPanel() {
  const [data, setData] = useState<CheckInData>(mockCheckInData);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config: CheckInConfig = mockCheckInConfig;

  // Lấy vị trí GPS
  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Trình duyệt không hỗ trợ định vị.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject('Không thể lấy vị trí GPS. Hãy bật định vị!'),
        { enableHighAccuracy: true }
      );
    });
  };

  // Xử lý upload/chụp ảnh
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  // Xử lý điểm danh
  const handleCheckIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const location = await getLocation();
      if (config.requirePhoto && !photo) {
        setError('Vui lòng chụp hoặc tải lên ảnh điểm danh!');
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setData({
          checkedIn: true,
          checkInTime: getCurrentTimeString(),
          location,
          photoUrl: photoUrl,
        });
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 mt-8">
      <h2 className="text-lg font-bold mb-2">Điểm danh bắt đầu ca</h2>
      <div className="mb-4">
        <Badge variant={data.checkedIn ? 'success' : 'warning'}>
          {data.checkedIn ? 'Đã điểm danh' : 'Chưa điểm danh'}
        </Badge>
      </div>
      {data.checkedIn ? (
        <div className="space-y-2">
          <div>
            <span className="font-medium">Thời gian điểm danh:</span> {data.checkInTime}
          </div>
          {data.location && (
            <div>
              <span className="font-medium">Vị trí:</span> {data.location.lat.toFixed(5)}, {data.location.lng.toFixed(5)}
            </div>
          )}
          {data.photoUrl && (
            <div>
              <span className="font-medium">Ảnh điểm danh:</span>
              <div className="mt-1">
                <ImagePreview src={data.photoUrl} alt="Ảnh điểm danh" previewSize="sm" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {config.requirePhoto && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Chụp hoặc tải lên ảnh điểm danh:</label>
              <Input type="file" accept="image/*" onChange={handlePhotoChange} />
              {photoUrl && (
                <div className="mt-2">
                  <ImagePreview src={photoUrl} alt="Ảnh điểm danh" previewSize="sm" />
                </div>
              )}
            </div>
          )}
          {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
          <Button onClick={handleCheckIn} disabled={loading} className="w-full">
            {loading ? 'Đang điểm danh...' : 'Điểm danh bắt đầu ca'}
          </Button>
        </>
      )}
    </Card>
  );
} 