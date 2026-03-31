import { db, usersTable, requestsTable, notificationsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const adminEmail = "shrushtipatil2905@gmail.com";
  const [existingAdmin] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail));

  let adminUser;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const [created] = await db.insert(usersTable).values({
      name: "Shrushti Patil",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      bio: "Platform administrator",
      location: "Mumbai, India",
      skillsOffered: ["Platform Management", "Community Building"],
      skillsWanted: ["Machine Learning", "Data Science"],
      isBlocked: false,
    }).returning();
    adminUser = created;
    console.log("Admin user created:", adminEmail);
  } else {
    adminUser = existingAdmin;
    console.log("Admin user already exists:", adminEmail);
  }

  const sampleUsers = [
    {
      name: "Arjun Sharma",
      email: "arjun.sharma@example.com",
      bio: "Full-stack developer passionate about teaching coding",
      location: "Bangalore, India",
      skillsOffered: ["JavaScript", "React", "Node.js", "TypeScript"],
      skillsWanted: ["UI/UX Design", "Figma", "Graphic Design"],
    },
    {
      name: "Priya Mehta",
      email: "priya.mehta@example.com",
      bio: "Designer with 5 years experience in product design",
      location: "Delhi, India",
      skillsOffered: ["UI/UX Design", "Figma", "Adobe XD", "Graphic Design"],
      skillsWanted: ["Python", "Machine Learning", "Data Analysis"],
    },
    {
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      bio: "Data scientist working on NLP and computer vision",
      location: "Hyderabad, India",
      skillsOffered: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
      skillsWanted: ["React", "Frontend Development", "JavaScript"],
    },
    {
      name: "Sneha Nair",
      email: "sneha.nair@example.com",
      bio: "Marketing specialist with digital strategy expertise",
      location: "Chennai, India",
      skillsOffered: ["Digital Marketing", "SEO", "Content Writing", "Social Media"],
      skillsWanted: ["Web Development", "WordPress", "HTML/CSS"],
    },
    {
      name: "Vikram Patel",
      email: "vikram.patel@example.com",
      bio: "Mobile app developer and fitness enthusiast",
      location: "Pune, India",
      skillsOffered: ["iOS Development", "Swift", "React Native", "Mobile UI"],
      skillsWanted: ["Photography", "Video Editing", "Premiere Pro"],
    },
  ];

  const createdUsers: (typeof usersTable.$inferSelect)[] = [];

  for (const userData of sampleUsers) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, userData.email));
    if (!existing) {
      const hashedPassword = await bcrypt.hash("Password@123", 10);
      const [user] = await db.insert(usersTable).values({
        ...userData,
        password: hashedPassword,
        role: "user",
        isBlocked: false,
      }).returning();
      createdUsers.push(user);
      console.log("Created user:", userData.email);
    } else {
      createdUsers.push(existing);
      console.log("User already exists:", userData.email);
    }
  }

  const allSampleUsers = createdUsers;
  if (allSampleUsers.length >= 3) {
    const existingRequests = await db.select().from(requestsTable);
    if (existingRequests.length === 0) {
      const sampleRequests = [
        {
          senderId: allSampleUsers[0].id,
          receiverId: allSampleUsers[1].id,
          skillOffered: "JavaScript",
          skillRequested: "UI/UX Design",
          message: "Hey! I noticed you do great UI/UX work. I can teach you JavaScript in exchange for some Figma lessons.",
          status: "pending",
        },
        {
          senderId: allSampleUsers[1].id,
          receiverId: allSampleUsers[2].id,
          skillOffered: "Figma",
          skillRequested: "Python",
          message: "I'd love to learn Python for data analysis. I can help with Figma and design in return.",
          status: "accepted",
        },
        {
          senderId: allSampleUsers[2].id,
          receiverId: allSampleUsers[0].id,
          skillOffered: "Machine Learning",
          skillRequested: "React",
          message: "Can we swap React lessons for ML tutorials? I think it would be a great exchange!",
          status: "completed",
        },
        {
          senderId: allSampleUsers[3].id,
          receiverId: allSampleUsers[4].id,
          skillOffered: "Digital Marketing",
          skillRequested: "iOS Development",
          message: "I can help grow your app's presence online if you teach me iOS development basics.",
          status: "pending",
        },
        {
          senderId: allSampleUsers[4].id,
          receiverId: allSampleUsers[2].id,
          skillOffered: "React Native",
          skillRequested: "Python",
          message: "Let's swap! I can teach you mobile development with React Native.",
          status: "rejected",
        },
      ];

      for (const reqData of sampleRequests) {
        await db.insert(requestsTable).values(reqData);
      }
      console.log("Sample requests created");

      await db.insert(notificationsTable).values([
        {
          userId: allSampleUsers[1].id,
          message: `${allSampleUsers[0].name} wants to swap skills with you — they offer "JavaScript" and want "UI/UX Design"`,
          type: "request",
          isRead: false,
        },
        {
          userId: allSampleUsers[0].id,
          message: `${allSampleUsers[2].name} sent you a skill swap request for Machine Learning!`,
          type: "request",
          isRead: true,
        },
        {
          userId: allSampleUsers[1].id,
          message: `${allSampleUsers[2].name} accepted your skill swap request!`,
          type: "accepted",
          isRead: false,
        },
      ]);
      console.log("Sample notifications created");
    } else {
      console.log("Requests already exist, skipping");
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
