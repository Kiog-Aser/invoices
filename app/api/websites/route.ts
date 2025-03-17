import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { authOptions } from "@/libs/next-auth";
import { ObjectId } from "mongodb";

// GET all websites for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    
    const websites = await db
      .collection("websites")
      .find({ userId: session.user.email })
      .toArray();

    // Transform website data and include notification count
    const websitesWithNotifications = websites.map(website => ({
      _id: website._id.toString(),
      domain: website.domain,
      notificationCount: (website.notifications || []).length
    }));
    
    return NextResponse.json(websitesWithNotifications);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { domain } = await req.json();
    
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Check if website already exists for this user
    const existingWebsite = await db
      .collection("websites")
      .findOne({ domain, userId: session.user.email });
    
    if (existingWebsite) {
      return NextResponse.json({ error: "Website already exists" }, { status: 400 });
    }
    
    const website = {
      domain,
      userId: session.user.email,
      createdAt: new Date(),
    };
    
    const result = await db.collection("websites").insertOne(website);
    
    // Return with consistent format
    return NextResponse.json({
      ...website,
      websiteId: result.insertedId.toString(),
      _id: result.insertedId.toString() // Include both formats for consistency
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 });
  }
}

/* Example of how to use this API in a dashboard component:
   
   // In your dashboard component where you list websites
   {websites.map((website) => (
     <div key={website._id}>
       <a href={`/dashboard/notifications/${website.websiteId}`}>
         {website.domain}
       </a>
     </div>
   ))}
*/
