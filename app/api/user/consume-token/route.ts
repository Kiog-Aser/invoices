import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import User from '@/models/User';
import connectMongo from '@/libs/mongoose';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ No authenticated user found for token consumption');
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    await connectMongo();
    console.log(`🔍 Consuming token for user: ${session.user.email}`);
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log(`❌ User not found with email: ${session.user.email}`);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`📊 User protocols data before consumption:`, JSON.stringify(user.protocols || {}));
    
    // Check for admin users - they don't need to consume tokens
    if (user.isAdmin) {
      console.log(`✅ Admin user doesn't consume tokens: ${user._id}`);
      return NextResponse.json({ 
        success: true, 
        isUnlimited: true,
        remainingTokens: 999,
        isAdmin: true,
        message: 'Admin access' 
      });
    }
    
    // If user has unlimited access, no need to consume tokens
    if (user.protocols?.isUnlimited) {
      // Still update the purchasedCount for tracking purposes
      if (!user.protocols) {
        user.protocols = {
          tokens: 0,
          isUnlimited: true,
          purchasedCount: 1,
        };
      } else {
        user.protocols.purchasedCount = (user.protocols.purchasedCount || 0) + 1;
      }
      user.protocols.lastGenerated = new Date();
      await user.save();
      
      console.log(`✅ Unlimited user generated protocol without consuming tokens: ${user._id}`);
      return NextResponse.json({ 
        success: true, 
        isUnlimited: true,
        remainingTokens: 0,
        message: 'Unlimited access' 
      });
    }
    
    // Check if user has available tokens
    if (!user.protocols?.tokens || user.protocols.tokens <= 0) {
      console.log(`❌ User has no tokens available: ${user._id}`);
      return NextResponse.json(
        { success: false, message: 'No protocol tokens available' },
        { status: 403 }
      );
    }
    
    // Initialize protocols object if it doesn't exist (shouldn't happen at this point)
    if (!user.protocols) {
      user.protocols = {
        tokens: 0,
        isUnlimited: false,
        purchasedCount: 0,
      };
    }
    
    // Consume one token
    user.protocols.tokens -= 1;
    user.protocols.purchasedCount = (user.protocols.purchasedCount || 0) + 1;
    user.protocols.lastGenerated = new Date();
    await user.save();
    
    console.log(`✅ Token consumed successfully. Remaining tokens: ${user.protocols.tokens}`);
    
    return NextResponse.json({
      success: true,
      remainingTokens: user.protocols.tokens,
      isUnlimited: false,
      message: 'Token consumed successfully'
    });
  } catch (error) {
    console.error('Error consuming protocol token:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}