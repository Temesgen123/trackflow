// prisma/seed.ts — Development seed data

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await db.user.upsert({
    where: { email: "demo@trackflow.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@trackflow.dev",
      passwordHash,
    },
  });

  // Create project
  const project = await db.project.create({
    data: {
      ownerId: user.id,
      name: "TrackFlow App",
      description: "Building the project tracker itself",
      status: "ACTIVE",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
    },
  });

  // Create phases
  const phases = await Promise.all([
    db.phase.create({ data: { projectId: project.id, name: "Requirements", status: "DONE",        orderIndex: 0 } }),
    db.phase.create({ data: { projectId: project.id, name: "Design",       status: "IN_PROGRESS", orderIndex: 1 } }),
    db.phase.create({ data: { projectId: project.id, name: "Development",  status: "TODO",        orderIndex: 2 } }),
    db.phase.create({ data: { projectId: project.id, name: "Testing",      status: "TODO",        orderIndex: 3 } }),
    db.phase.create({ data: { projectId: project.id, name: "Deployment",   status: "TODO",        orderIndex: 4 } }),
  ]);

  // Create milestones + tasks for Design phase
  const ms = await db.milestone.create({
    data: { phaseId: phases[1].id, name: "Design System", status: "IN_PROGRESS", dueDate: new Date("2025-02-28") },
  });

  // Create sprint
  const sprint = await db.sprint.create({
    data: {
      projectId: project.id,
      name: "Sprint 1",
      goal: "Complete design system and core API",
      status: "ACTIVE",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-02-14"),
    },
  });

  // Create tasks
  await db.task.createMany({
    data: [
      { milestoneId: ms.id, sprintId: sprint.id, title: "Define color tokens",       status: "DONE",        priority: "HIGH",   assigneeId: user.id },
      { milestoneId: ms.id, sprintId: sprint.id, title: "Design DB schema",           status: "IN_PROGRESS", priority: "URGENT", assigneeId: user.id },
      { milestoneId: ms.id, sprintId: sprint.id, title: "Build status badge component", status: "IN_REVIEW", priority: "MEDIUM", assigneeId: user.id },
      { milestoneId: ms.id, sprintId: sprint.id, title: "Write API route handlers",  status: "TODO",        priority: "HIGH",   assigneeId: user.id },
    ],
  });

  console.log("✅ Seed complete — demo@trackflow.dev / password123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
