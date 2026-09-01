import { PrismaClient, PublishStatus, MemberCategory, EventType, WorkshopLevel, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TRAIC database (demo content)...");

  // Admin user
  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "TraicAdmin2026!",
    12,
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@traic.dev" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@traic.dev",
      name: "TRAIC Admin",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // Categories
  const categories = await Promise.all(
    [
      { name: "Robotics", slug: "robotics", color: "#00d4ff" },
      { name: "AI/ML", slug: "ai-ml", color: "#1a6bff" },
      { name: "IoT", slug: "iot", color: "#00ff88" },
      { name: "Drones", slug: "drones", color: "#ff6b35" },
      { name: "Web", slug: "web", color: "#00d4ff" },
      { name: "Hardware", slug: "hardware", color: "#2a3140" },
      { name: "Automation", slug: "automation", color: "#1a6bff" },
      { name: "Research", slug: "research", color: "#00ff88" },
    ].map((cat, i) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { ...cat, order: i },
      }),
    ),
  );

  // Technologies
  const techNames = [
    "ROS", "Python", "ESP32", "Arduino", "React", "TensorFlow",
    "OpenCV", "Node.js", "TypeScript", "Docker",
  ];
  const technologies = await Promise.all(
    techNames.map((name) =>
      prisma.technology.upsert({
        where: { slug: name.toLowerCase().replace(/\//g, "-") },
        update: {},
        create: {
          name,
          slug: name.toLowerCase().replace(/\//g, "-"),
        },
      }),
    ),
  );

  // Members (demo)
  const memberData = [
    { name: "Alex Chen", slug: "alex-chen", role: "Club President", category: MemberCategory.CORE_TEAM, skills: ["Robotics", "ROS", "Leadership"] },
    { name: "Priya Sharma", slug: "priya-sharma", role: "AI Lead", category: MemberCategory.PROJECT_LEAD, skills: ["Python", "TensorFlow", "Computer Vision"] },
    { name: "Marcus Webb", slug: "marcus-webb", role: "Hardware Engineer", category: MemberCategory.CORE_TEAM, skills: ["ESP32", "PCB Design", "Embedded C"] },
    { name: "Sofia Rodriguez", slug: "sofia-rodriguez", role: "Drone Specialist", category: MemberCategory.PROJECT_LEAD, skills: ["Drones", "Flight Control", "PID"] },
    { name: "James Okonkwo", slug: "james-okonkwo", role: "Full-Stack Developer", category: MemberCategory.MEMBER, skills: ["React", "Node.js", "TypeScript"] },
    { name: "Emily Zhang", slug: "emily-zhang", role: "IoT Engineer", category: MemberCategory.MEMBER, skills: ["IoT", "MQTT", "Cloud"] },
    { name: "David Kim", slug: "david-kim", role: "Workshop Coordinator", category: MemberCategory.COORDINATOR, skills: ["Teaching", "Arduino", "Python"] },
    { name: "Nina Patel", slug: "nina-patel", role: "Research Lead", category: MemberCategory.MENTOR, skills: ["Research", "AI", "Publications"] },
    { name: "Ryan Foster", slug: "ryan-foster", role: "Automation Engineer", category: MemberCategory.MEMBER, skills: ["PLC", "Automation", "Python"] },
    { name: "Lisa Müller", slug: "lisa-muller", role: "Alumni Mentor", category: MemberCategory.ALUMNI, skills: ["Robotics", "Industry", "Mentoring"] },
    { name: "Tom Bradley", slug: "tom-bradley", role: "Embedded Developer", category: MemberCategory.MEMBER, skills: ["STM32", "FreeRTOS", "C"] },
    { name: "Ananya Reddy", slug: "ananya-reddy", role: "Computer Vision Lead", category: MemberCategory.PROJECT_LEAD, skills: ["OpenCV", "PyTorch", "ROS"] },
  ];

  const members = await Promise.all(
    memberData.map((m, i) =>
      prisma.member.upsert({
        where: { slug: m.slug },
        update: {},
        create: {
          ...m,
          bio: `[DEMO] ${m.name} is a passionate engineer contributing to TRAIC's ${m.skills[0]} initiatives.`,
          order: i,
          publishStatus: PublishStatus.PUBLISHED,
          createdById: admin.id,
        },
      }),
    ),
  );

  // Projects (demo)
  const projectData = [
    {
      title: "Autonomous Agricultural Rover",
      slug: "autonomous-agricultural-rover",
      description: "A ground rover for autonomous crop monitoring using computer vision and IoT sensors.",
      categorySlug: "robotics",
      status: "DEPLOYED",
      year: 2025,
      featured: true,
      problem: "Manual crop monitoring is time-consuming and inconsistent across large fields.",
      solution: "Built an ESP32-powered rover with CV-based plant health detection and cloud telemetry.",
      tech: ["ESP32", "Python", "OpenCV", "ROS"],
    },
    {
      title: "Smart Campus Navigation Drone",
      slug: "smart-campus-drone",
      description: "Autonomous drone system for campus mapping and surveillance demonstrations.",
      categorySlug: "drones",
      status: "TESTING",
      year: 2025,
      featured: true,
      problem: "Campus infrastructure mapping requires frequent updates.",
      solution: "Developed a GPS-guided drone with real-time SLAM and web dashboard.",
      tech: ["Python", "ROS", "OpenCV"],
    },
    {
      title: "TRAIC Command Dashboard",
      slug: "traic-command-dashboard",
      description: "Real-time monitoring dashboard for club projects and lab systems.",
      categorySlug: "web",
      status: "DEPLOYED",
      year: 2026,
      featured: true,
      problem: "No centralized view of project status and lab resources.",
      solution: "Full-stack React dashboard with WebSocket updates and role-based access.",
      tech: ["React", "Node.js", "TypeScript"],
    },
    {
      title: "Gesture-Controlled Robotic Arm",
      slug: "gesture-robotic-arm",
      description: "Computer vision powered robotic arm controlled via hand gestures.",
      categorySlug: "robotics",
      status: "IN_PROGRESS",
      year: 2026,
      featured: false,
      problem: "Traditional robot control interfaces are not intuitive.",
      solution: "MediaPipe hand tracking drives 6-DOF arm movements in real-time.",
      tech: ["Python", "OpenCV", "Arduino"],
    },
    {
      title: "IoT Environmental Monitor",
      slug: "iot-environmental-monitor",
      description: "Distributed sensor network for lab environment monitoring.",
      categorySlug: "iot",
      status: "DEPLOYED",
      year: 2024,
      featured: false,
      problem: "Lab equipment sensitive to temperature and humidity fluctuations.",
      solution: "ESP32 sensor nodes with MQTT aggregation and alert system.",
      tech: ["ESP32", "Node.js"],
    },
    {
      title: "ML-Powered Defect Detector",
      slug: "ml-defect-detector",
      description: "Deep learning system for manufacturing defect detection.",
      categorySlug: "ai-ml",
      status: "TESTING",
      year: 2025,
      featured: true,
      problem: "Manual quality inspection is slow and error-prone.",
      solution: "CNN-based classifier trained on synthetic and real defect datasets.",
      tech: ["Python", "TensorFlow", "OpenCV"],
    },
    {
      title: "Automated Greenhouse Controller",
      slug: "automated-greenhouse",
      description: "Closed-loop control system for greenhouse climate management.",
      categorySlug: "automation",
      status: "IN_PROGRESS",
      year: 2026,
      featured: false,
      problem: "Greenhouse climate requires constant manual adjustment.",
      solution: "PID-controlled ventilation, irrigation, and lighting automation.",
      tech: ["Arduino", "Python", "ESP32"],
    },
    {
      title: "Swarm Robotics Simulator",
      slug: "swarm-robotics-simulator",
      description: "Research platform for multi-agent robotics algorithm development.",
      categorySlug: "research",
      status: "DEPLOYED",
      year: 2024,
      featured: false,
      problem: "Testing swarm algorithms on physical robots is expensive.",
      solution: "Web-based 3D simulator with configurable agent behaviors.",
      tech: ["React", "TypeScript", "Python"],
    },
  ];

  for (const [i, p] of projectData.entries()) {
    const category = categories.find((c) => c.slug === p.categorySlug);
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        excerpt: p.description.slice(0, 120),
        status: p.status,
        year: p.year,
        featured: p.featured,
        order: i,
        categoryId: category?.id,
        problem: p.problem,
        solution: p.solution,
        architecture:
          "Modular stack: sensing → compute → actuation → telemetry dashboard.",
        hardware:
          "Custom chassis, motor drivers, sensor suite, and power distribution.",
        software:
          "Control firmware, perception pipeline, and a web operations dashboard.",
        challenges:
          "Integration between hardware timing constraints and ML inference latency.",
        results:
          "[DEMO] Prototype validated in lab conditions. Replace with real TRAIC results.",
        publishStatus: PublishStatus.PUBLISHED,
        createdById: admin.id,
      },
    });

    for (const techName of p.tech) {
      const tech = technologies.find((t) => t.name === techName);
      if (tech) {
        await prisma.projectTechnology.upsert({
          where: {
            projectId_technologyId: {
              projectId: project.id,
              technologyId: tech.id,
            },
          },
          update: {},
          create: { projectId: project.id, technologyId: tech.id },
        });
      }
    }

    // Assign contributors
    const contributor = members[i % members.length];
    await prisma.projectContributor.upsert({
      where: {
        projectId_memberId: {
          projectId: project.id,
          memberId: contributor.id,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        memberId: contributor.id,
        role: "Lead Developer",
      },
    });
  }

  // Events (demo)
  const events = [
    { title: "TRAIC Annual Hackathon 2026", slug: "hackathon-2026", type: EventType.HACKATHON, daysFromNow: 30 },
    { title: "Intro to ROS Workshop", slug: "ros-workshop", type: EventType.WORKSHOP, daysFromNow: 14 },
    { title: "AI Robotics Challenge", slug: "ai-robotics-challenge", type: EventType.COMPETITION, daysFromNow: -60 },
    { title: "Industry Tech Talk: Autonomous Systems", slug: "tech-talk-autonomous", type: EventType.TECH_TALK, daysFromNow: 7 },
    { title: "Project Exhibition 2025", slug: "exhibition-2025", type: EventType.EXHIBITION, daysFromNow: -120 },
  ];

  for (const [i, e] of events.entries()) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + e.daysFromNow);
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        title: e.title,
        slug: e.slug,
        description: `[DEMO] ${e.title} — a TRAIC community event for learning and collaboration.`,
        type: e.type,
        location: "University Campus",
        startDate,
        featured: i < 2,
        publishStatus: PublishStatus.PUBLISHED,
        createdById: admin.id,
      },
    });
  }

  // Workshops (demo)
  const workshops = [
    { title: "Arduino Fundamentals", slug: "arduino-fundamentals", track: "Hardware", level: WorkshopLevel.BEGINNER, instructor: "David Kim" },
    { title: "ESP32 & IoT Development", slug: "esp32-iot", track: "Hardware", level: WorkshopLevel.INTERMEDIATE, instructor: "Emily Zhang" },
    { title: "Python for Robotics", slug: "python-robotics", track: "Software", level: WorkshopLevel.BEGINNER, instructor: "Priya Sharma" },
    { title: "React & Modern Web Dev", slug: "react-webdev", track: "Software", level: WorkshopLevel.INTERMEDIATE, instructor: "James Okonkwo" },
    { title: "Introduction to Machine Learning", slug: "intro-ml", track: "AI", level: WorkshopLevel.BEGINNER, instructor: "Priya Sharma" },
    { title: "ROS2 Navigation Stack", slug: "ros2-navigation", track: "Robotics", level: WorkshopLevel.ADVANCED, instructor: "Alex Chen" },
  ];

  for (const [i, w] of workshops.entries()) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i + 1) * 7);
    await prisma.workshop.upsert({
      where: { slug: w.slug },
      update: {},
      create: {
        title: w.title,
        slug: w.slug,
        description: `[DEMO] Learn ${w.title} with hands-on projects and mentorship.`,
        instructor: w.instructor,
        track: w.track,
        level: w.level,
        duration: "3 hours",
        startDate,
        registrationOpen: true,
        maxSeats: 30,
        order: i,
        publishStatus: PublishStatus.PUBLISHED,
        createdById: admin.id,
      },
    });
  }

  // Achievements (demo - clearly marked)
  const achievements = [
    { title: "AI Robotics Challenge — 1st Place", slug: "ai-robotics-2026", year: 2026, missionNumber: 21, rank: "FIRST PLACE", org: "[DEMO] Regional Competition" },
    { title: "Robotics Excellence Award", slug: "robotics-excellence-2025", year: 2025, missionNumber: 14, rank: "EXCELLENCE AWARD", org: "[DEMO] University Tech Fest" },
    { title: "Smart India Hackathon — Finalist", slug: "sih-finalist-2025", year: 2025, missionNumber: 12, rank: "FINALIST", org: "[DEMO] SIH 2025" },
    { title: "Best IoT Project — Tech Summit", slug: "iot-summit-2024", year: 2024, missionNumber: 8, rank: "BEST PROJECT", org: "[DEMO] Tech Summit" },
    { title: "Drone Racing Championship — 2nd", slug: "drone-racing-2024", year: 2024, missionNumber: 6, rank: "SECOND PLACE", org: "[DEMO] Aero Club" },
    { title: "100+ Active Members Milestone", slug: "members-milestone", year: 2025, missionNumber: 10, rank: "MILESTONE", org: "TRAIC Community" },
    { title: "25 Workshops Completed", slug: "workshops-milestone", year: 2025, missionNumber: 11, rank: "MILESTONE", org: "TRAIC Learning" },
    { title: "Open Source Release — TRAIC SDK", slug: "opensource-sdk", year: 2026, missionNumber: 20, rank: "RELEASE", org: "TRAIC GitHub" },
  ];

  for (const [i, a] of achievements.entries()) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        title: a.title,
        slug: a.slug,
        description: `[DEMO] ${a.title} — sample achievement entry for development.`,
        year: a.year,
        missionNumber: a.missionNumber,
        rank: a.rank,
        organization: a.org,
        featured: i < 3,
        order: i,
        publishStatus: PublishStatus.PUBLISHED,
        createdById: admin.id,
      },
    });
  }

  // Site settings
  await prisma.siteSetting.upsert({
    where: { key: "demo_mode" },
    update: { value: "true" },
    create: { key: "demo_mode", value: "true" },
  });

  console.log("✅ Seed complete!");
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || "TraicAdmin2026!"}`);
  console.log("   ⚠️  All content is DEMO data — replace with real TRAIC data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
