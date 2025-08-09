import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all subscriptions with package info
    const subscriptions = await prisma.subscription.findMany({
      include: {
        package: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { customerId: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    console.log('=== SUBSCRIPTION ANALYSIS ===');
    
    // Group by customer
    const byCustomer = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.customerId]) {
        acc[sub.customerId] = [];
      }
      acc[sub.customerId].push(sub);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [customerId, subs] of Object.entries(byCustomer)) {
      console.log(`\nCustomer: ${customerId} (${subs[0]?.customer?.email})`);
      subs.forEach(sub => {
        console.log(`  Subscription: ${sub.id}`);
        console.log(`    Plan: ${sub.planName}`);
        console.log(`    PackageId: ${sub.packageId}`);
        console.log(`    Package Name: ${sub.package?.name}`);
        console.log(`    Created: ${sub.createdAt}`);
      });
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        customerId: sub.customerId,
        customerEmail: sub.customer?.email,
        planName: sub.planName,
        packageId: sub.packageId,
        packageName: sub.package?.name,
        createdAt: sub.createdAt
      }))
    });

  } catch (error) {
    console.error('Debug subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
