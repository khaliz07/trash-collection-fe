import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;
    
    const packageData = await prisma.package.findUnique({
      where: { id: packageId }
    });

    if (!packageData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy gói dịch vụ' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể tải thông tin gói dịch vụ' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;
    const data = await request.json();
    
    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        duration: data.duration,
        price: data.price,
        collectionsPerWeek: data.collectionsPerWeek,
        features: data.features,
        status: data.status,
        isPopular: data.isPopular,
        displayOrder: data.displayOrder
      }
    });

    return NextResponse.json({
      success: true,
      package: updatedPackage
    });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể cập nhật gói dịch vụ' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id;
    
    // Check if package is being used in any active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { 
        packageId: packageId,
        status: 'ACTIVE'
      }
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không thể xóa gói đang có người sử dụng. Hãy chuyển sang trạng thái INACTIVE thay vì xóa.' 
        },
        { status: 400 }
      );
    }

    await prisma.package.delete({
      where: { id: packageId }
    });

    return NextResponse.json({
      success: true,
      message: 'Gói dịch vụ đã được xóa'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể xóa gói dịch vụ' 
      },
      { status: 500 }
    );
  }
}
