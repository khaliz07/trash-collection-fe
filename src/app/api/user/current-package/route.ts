import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId, validateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    
    // Validate user exists
    const isValidUser = await validateUser(userId, prisma);
    if (!isValidUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User không tồn tại' 
        },
        { status: 401 }
      );
    }

    // Get current active subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        customerId: userId,
        status: 'ACTIVE'
      },
      include: {
        customer: true,
        package: true, // Include package information
        payments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })
    
    if (!subscription) {
      return NextResponse.json({
        success: false,
        message: 'No active package found',
        package: null
      })
    }

    // Calculate collections stats
    const totalCollections = await prisma.collection.count({
      where: {
        customerId: userId,
        subscriptionId: subscription.id
      }
    })

    const completedCollections = await prisma.collection.count({
      where: {
        customerId: userId,
        subscriptionId: subscription.id,
        status: 'COMPLETED'
      }
    })

    // Get next scheduled collection
    const nextCollection = await prisma.collection.findFirst({
      where: {
        customerId: userId,
        status: 'SCHEDULED',
        scheduledDate: {
          gte: new Date()
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    })

    // Calculate status based on dates
    const now = new Date()
    const endDate = subscription.endDate ? new Date(subscription.endDate) : new Date(subscription.nextBillingDate)
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    let status = 'active'
    if (daysLeft < 0) {
      status = 'expired'
    } else if (daysLeft <= 7) {
      status = 'expiring'
    }

    // Calculate collection totals based on package or frequency
    let collectionsTotal = 8 // default
    let collectionsPerWeek = 2 // default
    let packageFeatures = [
      'Thu gom rác sinh hoạt',
      'Thu gom 2 lần/tuần',
      'Hỗ trợ 24/7',
      'Thông báo lịch thu gom'
    ]
    
    // Use package info if available
    if (subscription.package) {
      collectionsPerWeek = subscription.package.collectionsPerWeek
      packageFeatures = subscription.package.features
      
      // Calculate total collections based on package duration and frequency
      const durationInWeeks = subscription.package.duration * 4 // assume 4 weeks per month
      collectionsTotal = collectionsPerWeek * durationInWeeks
    } else {
      // Fallback to frequency-based calculation
      if (subscription.frequency === 'MONTHLY') {
        collectionsTotal = 8 // 2 times per week * 4 weeks
      } else if (subscription.frequency === 'BI_WEEKLY') {
        collectionsTotal = 4 // 2 times per week * 2 weeks
      }
    }

    const packageData = {
      id: subscription.id,
      name: subscription.package?.name || subscription.planName,
      type: subscription.package?.type || subscription.frequency.toLowerCase(),
      startDate: subscription.startDate.toISOString(),
      endDate: endDate.toISOString(),
      status,
      fee: Number(subscription.package?.price || subscription.price),
      area: subscription.customer.address || 'Phường Linh Trung, Quận Thủ Đức, TP. HCM',
      description: subscription.package?.description || subscription.description || 'Thu gom rác 2 lần/tuần (Thứ 3 và Thứ 6)',
      features: packageFeatures,
      collectionsUsed: completedCollections,
      collectionsTotal: collectionsTotal,
      collectionsPerWeek: collectionsPerWeek,
      nextCollection: nextCollection?.scheduledDate?.toISOString() || null,
      autoRenewal: true, // Default for now
      daysLeft,
      isExpiringSoon: daysLeft <= 7 && daysLeft >= 0,
      canRenew: daysLeft <= 30,
      renewalPrice: calculateRenewalPrice(subscription.package?.type || subscription.frequency.toLowerCase()),
      packageId: subscription.packageId,
      duration: subscription.package?.duration || 1
    }

    return NextResponse.json({
      success: true,
      package: packageData
    })

  } catch (error) {
    console.error('Error fetching current package:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserId(request);
    
    // Validate user exists
    const isValidUser = await validateUser(userId, prisma);
    if (!isValidUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User không tồn tại' 
        },
        { status: 401 }
      );
    }

    const body = await request.json()
    const { action, data } = body

    // Get current subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        customerId: userId,
        status: 'ACTIVE'
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Package not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'toggle_auto_renewal':
        // In real implementation, this would update autoRenewal field in subscription
        // For now, just return success
        break
        
      case 'extend_package':
        const extensionMonths = data.months || 1
        const currentEnd = subscription.endDate ? new Date(subscription.endDate) : new Date(subscription.nextBillingDate)
        currentEnd.setMonth(currentEnd.getMonth() + extensionMonths)
        
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            endDate: currentEnd,
            status: 'ACTIVE'
          }
        })
        break
        
      case 'upgrade_package':
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            planName: data.name,
            frequency: data.type?.toUpperCase(),
            price: data.fee
          }
        })
        break
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully'
    })

  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateRenewalPrice(packageType: string): number {
  // Base prices with 50% discount applied (80k → 40k)
  const prices = {
    weekly: 40000,     // was 80000
    bi_weekly: 75000,  // was 150000  
    monthly: 125000,   // was 250000
    quarterly: 350000, // was 700000
    yearly: 1250000    // was 2500000
  }
  return prices[packageType as keyof typeof prices] || 40000
}
