"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  };

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `image-${index + 1}.jpg`;
    link.click();
  };

  return (
    <>
      <div className={className}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src={image}
                  alt={`Ảnh ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => openLightbox(index)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Ảnh {selectedIndex !== null ? selectedIndex + 1 : 1} / {images.length}</span>
              <div className="flex gap-2">
                {selectedIndex !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage(images[selectedIndex], selectedIndex)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedIndex !== null && (
            <div className="relative">
              <img
                src={images[selectedIndex]}
                alt={`Ảnh ${selectedIndex + 1}`}
                className="w-full max-h-[70vh] object-contain"
              />
              
              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
