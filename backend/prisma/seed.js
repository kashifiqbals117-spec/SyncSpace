import { PrismaClient, Role, ProjectStatus, TaskStatus, TaskPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Upsert users
  const alex = await prisma.user.upsert({
    where: { email: 'alex@syncspace.dev' },
    update: {},
    create: {
      email: 'alex@syncspace.dev',
      name: 'Alex Morgan',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&q=80',
    },
  });

  const elena = await prisma.user.upsert({
    where: { email: 'elena@syncspace.dev' },
    update: {},
    create: {
      email: 'elena@syncspace.dev',
      name: 'Elena Rostova',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&fit=crop&q=80',
    },
  });

  const david = await prisma.user.upsert({
    where: { email: 'david@syncspace.dev' },
    update: {},
    create: {
      email: 'david@syncspace.dev',
      name: 'David Chen',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&fit=crop&q=80',
    },
  });

  const maya = await prisma.user.upsert({
    where: { email: 'maya@syncspace.dev' },
    update: {},
    create: {
      email: 'maya@syncspace.dev',
      name: 'Maya Lin',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&fit=crop&q=80',
    },
  });

  console.log('Users seeded.');

  // 2. Main Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { slug: 'acme-corp' },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Acme Workspace',
        slug: 'acme-corp',
        description: 'Primary product engineering and design workspace for Acme Corp.',
        ownerId: alex.id,
      },
    });
  }

  // Workspace memberships
  const memberships = [
    { userId: alex.id, role: Role.OWNER },
    { userId: elena.id, role: Role.ADMIN },
    { userId: david.id, role: Role.MEMBER },
    { userId: maya.id, role: Role.MEMBER },
  ];

  for (const m of memberships) {
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: m.userId,
        },
      },
      update: { role: m.role },
      create: {
        workspaceId: workspace.id,
        userId: m.userId,
        role: m.role,
      },
    });
  }

  // Second Workspace for Alex
  let devWorkspace = await prisma.workspace.findFirst({
    where: { slug: 'design-system-lab' },
  });
  if (!devWorkspace) {
    devWorkspace = await prisma.workspace.create({
      data: {
        name: 'Design System Lab',
        slug: 'design-system-lab',
        description: 'Cross-platform component library and accessibility guidelines.',
        ownerId: alex.id,
      },
    });
    await prisma.workspaceMember.create({
      data: {
        workspaceId: devWorkspace.id,
        userId: alex.id,
        role: Role.OWNER,
      },
    });
    await prisma.workspaceMember.create({
      data: {
        workspaceId: devWorkspace.id,
        userId: maya.id,
        role: Role.ADMIN,
      },
    });
  }

  console.log('Workspaces and members seeded.');

  // 3. Projects
  let project1 = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: 'Cloud Dashboard 2.0' },
  });

  if (!project1) {
    project1 = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Cloud Dashboard 2.0',
        description: 'Modern analytics and workspace overview application with real-time graphs.',
        status: ProjectStatus.ACTIVE,
        color: '#6366f1',
        creatorId: alex.id,
      },
    });
  }

  let project2 = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: 'Mobile App Redesign' },
  });

  if (!project2) {
    project2 = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Mobile App Redesign',
        description: 'iOS and Android client overhaul with offline synchronization.',
        status: ProjectStatus.ACTIVE,
        color: '#10b981',
        creatorId: elena.id,
      },
    });
  }

  console.log('Projects seeded.');

  // 4. Tasks for Project 1
  const existingTasks = await prisma.task.count({ where: { projectId: project1.id } });
  if (existingTasks === 0) {
    const tasksData = [
      {
        title: 'Design high-fidelity dashboard layout',
        description: 'Create Figma prototypes for the multi-tenant sidebar, stat cards, and project progress widgets.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        position: 1000.0,
        assigneeId: maya.id,
        creatorId: alex.id,
        dueDate: new Date(Date.now() - 86400000 * 3),
        completedAt: new Date(Date.now() - 86400000 * 2),
        labels: [{ name: 'Design', color: '#ec4899' }, { name: 'UI/UX', color: '#8b5cf6' }],
      },
      {
        title: 'Implement database schema with Prisma & PostgreSQL',
        description: 'Configure relational schema, foreign key constraints, indexes, and write migration scripts.',
        status: TaskStatus.DONE,
        priority: TaskPriority.URGENT,
        position: 2000.0,
        assigneeId: david.id,
        creatorId: alex.id,
        dueDate: new Date(Date.now() - 86400000),
        completedAt: new Date(),
        labels: [{ name: 'Backend', color: '#10b981' }, { name: 'Database', color: '#3b82f6' }],
      },
      {
        title: 'Setup Socket.IO real-time event pipeline',
        description: 'Ensure authenticated WebSocket handshakes and room-based multi-user broadcasts.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        position: 1000.0,
        assigneeId: david.id,
        creatorId: alex.id,
        dueDate: new Date(Date.now() + 86400000 * 2),
        labels: [{ name: 'Backend', color: '#10b981' }, { name: 'Real-time', color: '#f59e0b' }],
      },
      {
        title: 'Kanban drag-and-drop card interaction',
        description: 'Implement optimistic drag-and-drop column movements with dnd-kit and transactional position persistence.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        position: 2000.0,
        assigneeId: alex.id,
        creatorId: alex.id,
        dueDate: new Date(Date.now() + 86400000 * 1),
        labels: [{ name: 'Frontend', color: '#6366f1' }, { name: 'Core Feature', color: '#ef4444' }],
      },
      {
        title: 'Build task detail drawer with comments feed',
        description: 'Support commenting, activity history stream, label assignment, and assignee selection.',
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.MEDIUM,
        position: 1000.0,
        assigneeId: elena.id,
        creatorId: alex.id,
        dueDate: new Date(Date.now() + 86400000 * 3),
        labels: [{ name: 'Frontend', color: '#6366f1' }],
      },
      {
        title: 'Implement workspace invitation email flow',
        description: 'Provide single-use cryptographically secure invitation tokens with dev fallbacks.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        position: 1000.0,
        assigneeId: david.id,
        creatorId: elena.id,
        dueDate: new Date(Date.now() + 86400000 * 4),
        labels: [{ name: 'Auth', color: '#64748b' }, { name: 'Security', color: '#06b6d4' }],
      },
      {
        title: 'Audit WCAG 2.1 AA keyboard accessibility',
        description: 'Test tab order, aria-expanded on menus, and visible focus rings on dark theme.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        position: 1000.0,
        assigneeId: maya.id,
        creatorId: alex.id,
        dueDate: new Date(Date.now() + 86400000 * 10),
        labels: [{ name: 'Accessibility', color: '#a855f7' }],
      },
      {
        title: 'Benchmark multi-user concurrency limits',
        description: 'Run load simulation with 50 concurrent socket clients broadcasting task edits.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        position: 2000.0,
        assigneeId: null,
        creatorId: alex.id,
        dueDate: null,
        labels: [{ name: 'QA', color: '#f97316' }],
      },
    ];

    for (const t of tasksData) {
      const createdTask = await prisma.task.create({
        data: {
          projectId: project1.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          position: t.position,
          assigneeId: t.assigneeId,
          creatorId: t.creatorId,
          dueDate: t.dueDate,
          completedAt: t.completedAt,
          labels: {
            create: t.labels.map((l) => ({ name: l.name, color: l.color })),
          },
          activities: {
            create: [
              {
                userId: t.creatorId,
                type: 'CREATED',
                details: 'Task was created.',
              },
            ],
          },
        },
      });

      // Add comments on key tasks
      if (t.title.includes('Kanban')) {
        await prisma.taskComment.create({
          data: {
            taskId: createdTask.id,
            authorId: david.id,
            content: 'I verified dnd-kit sortable strategy works smoothly with virtual lists if needed.',
          },
        });
        await prisma.taskComment.create({
          data: {
            taskId: createdTask.id,
            authorId: alex.id,
            content: 'Great! Make sure optimistic position updating handles failed network responses gracefully.',
          },
        });
      }
    }
  }

  // 5. Seed notifications for Alex
  const notifCount = await prisma.notification.count({ where: { userId: alex.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: alex.id,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: 'Elena assigned you to "Kanban drag-and-drop card interaction"',
          read: false,
        },
        {
          userId: alex.id,
          type: NotificationType.TASK_COMMENT,
          title: 'New Comment',
          message: 'David commented on "Kanban drag-and-drop card interaction"',
          read: false,
        },
        {
          userId: alex.id,
          type: NotificationType.WORKSPACE_INVITE,
          title: 'Welcome to SyncSpace',
          message: 'Your Acme Workspace is ready. Invite teammates to start collaborating.',
          read: true,
        },
      ],
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
