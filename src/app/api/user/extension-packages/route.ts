import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all active packages for extension options
    const packages = await prisma.package.findMany({
      where: { 
        status: 'ACTIVE' 
      },
      orderBy: [
        { isPopular: 'desc' }, // Popular packages first
        { displayOrder: 'asc' }, // Then by display order
        { price: 'asc' } // Then by price
      ]
    });

    // Transform packages into extension format
    const extensionPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      type: pkg.type,
      duration: pkg.duration,
      price: Number(pkg.price),
      collectionsPerWeek: pkg.collectionsPerWeek,
      features: pkg.features,
      isPopular: pkg.isPopular,
      // Extension-specific calculations
      basePrice: Number(pkg.price),
      discount: pkg.isPopular ? 5 : 0, // 5% discount for popular packages
      final: pkg.isPopular ? Math.round(Number(pkg.price) * 0.95) : Number(pkg.price),
      label: pkg.isPopular ? 'Phổ biến' : (pkg.type === 'monthly' ? 'Gợi ý' : 'Tiết kiệm'),
      durationText: pkg.duration === 1 ? '1 tháng' : 
                    pkg.duration === 3 ? '3 tháng' : 
                    pkg.duration === 12 ? '1 năm' : `${pkg.duration} tháng`,
      benefit: pkg.duration === 1 ? 'Tiện lợi, linh hoạt' :
               pkg.duration === 3 ? 'Tiết kiệm 5% so với tháng' :
               pkg.duration === 12 ? 'Tiết kiệm 10% + tặng 1 tháng' :
               `Gói ${pkg.duration} tháng`
    }));

    return NextResponse.json({
      success: true,
      packages: extensionPackages
    });

  } catch (error) {
    console.error('Error fetching extension packages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể tải danh sách gói gia hạn' 
      },
      { status: 500 }
    );
  }
}
