import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import User from '@/models/User';
import connectMongo from '@/libs/mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ No authenticated user found for protocol access check');
      return NextResponse.json(
        { hasAccess: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    await connectMongo();
    console.log(`🔍 Checking protocol access for user: ${session.user.email}`);
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log(`❌ User not found with email: ${session.user.email}`);
      return NextResponse.json(
        { hasAccess: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`📊 User data:`, JSON.stringify({
      plan: user.plan,
      protocols: user.protocols || {}
    }));
    
    // Check for admin users - they always have access
    if (user.isAdmin) {
      console.log(`✅ Admin user has automatic access: ${user._id}`);
      return NextResponse.json({
        hasAccess: true,
        remainingTokens: 999,
        isUnlimited: true,
        isAdmin: true
      });
    }
    
    // --- Subscription-based access control ---
    // Allow access if user has an active paid subscription (pro plan, active/trialing, and not expired)
    const now = new Date();
    const isSubscriptionActive =
      user.plan === 'pro' &&
      (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') &&
      user.currentPeriodEnd &&
      new Date(user.currentPeriodEnd) > now;

    if (isSubscriptionActive) {
      return NextResponse.json({
        hasAccess: true,
        remainingTokens: 999,
        isUnlimited: true,
        isAdmin: false,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
      });
    }

    // Fallback: legacy token/unlimited logic (for one-time purchases)
    const isUnlimited = !!user.protocols?.isUnlimited;
    const tokens = user.protocols?.tokens ?? 0;
    const hasAccess = isUnlimited || tokens > 0;
    
    console.log(`✅ Access check complete - hasAccess: ${hasAccess}, isUnlimited: ${isUnlimited}, tokens: ${tokens}`);
    
    return NextResponse.json({
      hasAccess,
      remainingTokens: tokens,
      isUnlimited,
      subscriptionStatus: user.subscriptionStatus || '',
      currentPeriodEnd: user.currentPeriodEnd || null,
    });
  } catch (error) {
    console.error('Error checking protocol access:', error);
    return NextResponse.json(
      { hasAccess: false, message: 'Server error' },
      { status: 500 }
    );
  }
}