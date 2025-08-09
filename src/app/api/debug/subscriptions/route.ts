import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all subscriptions with package info
    const subscriptions = await prisma.subscription.findMany({
      include: {
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { userId: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    console.log('=== SUBSCRIPTION ANALYSIS ===');
    
    // Group by user
    const byUser = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.userId]) {
        acc[sub.userId] = [];
      }
      acc[sub.userId].push(sub);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [userId, subs] of Object.entries(byUser)) {
      console.log(`\nUser: ${userId} (${subs[0]?.user?.email})`);
      subs.forEach(sub => {
        console.log(`  Subscription: ${sub.id}`);
        console.log(`    PackageId: ${sub.packageId}`);
        console.log(`    Package Name: ${sub.package?.name}`);
        console.log(`    Status: ${sub.status}`);
        console.log(`    Created: ${sub.createdAt}`);
      });
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        userEmail: sub.user?.email,
        userName: sub.user?.name,
        packageId: sub.packageId,
        packageName: sub.package?.name,
        status: sub.status,
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
