import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充测试数据...')

  // ========== 1. 创建用户 ==========
  const user = await prisma.user.upsert({
    where: { email: 'demo@planrea.app' },
    update: {},
    create: {
      email: 'demo@planrea.app',
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
      preferences: {
        create: {
          workStartTime: '09:00',
          workEndTime: '18:00',
          workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          defaultTaskDuration: 30,
          breakDuration: 10,
          pomodoroWorkDuration: 25,
          preferredEnergyLevel: 'MEDIUM',
          morningEnergyLevel: 'HIGH',
          afternoonEnergyLevel: 'MEDIUM',
          eveningEnergyLevel: 'LOW',
          emailNotifications: true,
          pushNotifications: true,
          reminderBeforeMinutes: 15,
          timezone: 'Asia/Shanghai',
          language: 'zh-CN',
        }
      }
    }
  })
  console.log(`✅ 创建用户: ${user.name} (${user.email})`)

  // ========== 2. 创建计划 ==========
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        userId: user.id,
        title: '学习 TypeScript',
        description: '系统学习 TypeScript，从基础到高级特性',
        goal: '在 2 个月内掌握 TypeScript，能够独立开发类型安全的应用程序',
        deadline: new Date('2026-06-01'),
        status: 'ACTIVE',
        progress: 25.5,
      }
    }),
    prisma.plan.create({
      data: {
        userId: user.id,
        title: '产品发布计划',
        description: 'PlanRea 产品的首次公开发布准备',
        goal: '成功发布 v1.0 版本，获得 1000 名早期用户',
        deadline: new Date('2026-05-15'),
        status: 'ACTIVE',
        progress: 45.0,
      }
    }),
    prisma.plan.create({
      data: {
        userId: user.id,
        title: '健身计划',
        description: '每周 4 次健身房训练，增肌减脂',
        goal: '3 个月内减重 5kg，增加肌肉量 3kg',
        deadline: new Date('2026-07-01'),
        status: 'ACTIVE',
        progress: 10.0,
      }
    })
  ])
  console.log(`✅ 创建 ${plans.length} 个计划`)

  // ========== 3. 创建任务 ==========
  const tsPlan = plans[0]
  const productPlan = plans[1]
  const fitnessPlan = plans[2]

  const tasks = await Promise.all([
    // TypeScript 学习任务
    prisma.task.create({
      data: {
        userId: user.id,
        planId: tsPlan.id,
        title: '学习基础类型',
        description: '学习 string, number, boolean, array, tuple 等基础类型',
        estimatedMinutes: 60,
        priority: 'HIGH',
        energyLevel: 'HIGH',
        category: 'STUDY',
        status: 'COMPLETED',
        orderIndex: 1,
        scheduledDate: new Date('2026-04-01'),
        actualMinutes: 75,
        completedAt: new Date('2026-04-01T11:00:00'),
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        planId: tsPlan.id,
        title: '学习接口和类型别名',
        description: '深入理解 interface 和 type 的区别与使用场景',
        estimatedMinutes: 90,
        priority: 'HIGH',
        energyLevel: 'HIGH',
        category: 'STUDY',
        status: 'IN_PROGRESS',
        orderIndex: 2,
        scheduledDate: new Date('2026-04-06'),
        actualMinutes: 30,
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        planId: tsPlan.id,
        title: '学习泛型',
        description: '掌握泛型的概念和高级用法',
        estimatedMinutes: 120,
        priority: 'MEDIUM',
        energyLevel: 'MEDIUM',
        category: 'STUDY',
        status: 'TODO',
        orderIndex: 3,
        scheduledDate: new Date('2026-04-08'),
      }
    }),
    // 产品发布任务
    prisma.task.create({
      data: {
        userId: user.id,
        planId: productPlan.id,
        title: '完成数据库 Schema 设计',
        description: '设计完整的 Prisma 数据库模型',
        estimatedMinutes: 180,
        priority: 'URGENT',
        energyLevel: 'HIGH',
        category: 'WORK',
        status: 'IN_PROGRESS',
        orderIndex: 1,
        scheduledDate: new Date('2026-04-06'),
        contextTags: ['电脑', '深度工作'],
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        planId: productPlan.id,
        title: '撰写产品文档',
        description: '编写用户手册和 API 文档',
        estimatedMinutes: 240,
        priority: 'HIGH',
        energyLevel: 'MEDIUM',
        category: 'CREATIVE',
        status: 'TODO',
        orderIndex: 2,
        scheduledDate: new Date('2026-04-07'),
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        planId: productPlan.id,
        title: '团队周会',
        description: '同步项目进度，讨论下周计划',
        estimatedMinutes: 60,
        priority: 'MEDIUM',
        energyLevel: 'MEDIUM',
        category: 'MEETING',
        status: 'TODO',
        orderIndex: 3,
        scheduledDate: new Date('2026-04-07'),
        scheduledStart: new Date('2026-04-07T10:00:00'),
        scheduledEnd: new Date('2026-04-07T11:00:00'),
        contextTags: ['会议室', '团队协作'],
      }
    }),
    // 健身任务
    prisma.task.create({
      data: {
        userId: user.id,
        planId: fitnessPlan.id,
        title: '胸部训练',
        description: '卧推 4组, 哑铃飞鸟 3组, 俯卧撑 3组',
        estimatedMinutes: 60,
        priority: 'MEDIUM',
        energyLevel: 'HIGH',
        category: 'HEALTH',
        status: 'TODO',
        orderIndex: 1,
        scheduledDate: new Date('2026-04-07'),
        location: '金吉鸟健身房',
      }
    }),
    // 独立任务（无计划）
    prisma.task.create({
      data: {
        userId: user.id,
        title: '回复邮件',
        description: '处理积压的工作邮件',
        estimatedMinutes: 30,
        priority: 'LOW',
        energyLevel: 'LOW',
        category: 'ADMIN',
        status: 'TODO',
        contextTags: ['碎片时间'],
      }
    }),
  ])
  console.log(`✅ 创建 ${tasks.length} 个任务`)

  // ========== 4. 创建任务依赖 ==========
  const [task1, task2, task3] = [tasks[0], tasks[1], tasks[2]]
  
  await prisma.taskDependency.create({
    data: {
      taskId: task2.id,      // "学习接口和类型别名" 依赖
      dependsOnId: task1.id, // "学习基础类型" 完成后才能开始
      dependencyType: 'BLOCKS',
    }
  })
  await prisma.taskDependency.create({
    data: {
      taskId: task3.id,      // "学习泛型" 依赖
      dependsOnId: task2.id, // "学习接口和类型别名" 完成后才能开始
      dependencyType: 'BLOCKS',
    }
  })
  console.log('✅ 创建任务依赖关系')

  // ========== 5. 创建日历连接 ==========
  const calendarConnection = await prisma.calendarConnection.create({
    data: {
      userId: user.id,
      provider: 'GOOGLE',
      providerId: 'primary',
      accountEmail: 'demo@planrea.app',
      accessToken: 'ya29.a0AfH6SMBx...',
      refreshToken: '1//0dx...',
      tokenExpiresAt: new Date('2026-04-07T12:00:00'),
      syncEnabled: true,
      importEvents: true,
      exportTasks: true,
      lastSyncAt: new Date('2026-04-06T09:00:00'),
    }
  })
  console.log('✅ 创建日历连接')

  // ========== 6. 创建日历事件 ==========
  const meetingTask = tasks[5] // 团队周会
  await prisma.calendarEvent.create({
    data: {
      calendarConnectionId: calendarConnection.id,
      taskId: meetingTask.id,
      externalEventId: 'google_event_001',
      title: meetingTask.title,
      description: meetingTask.description,
      startTime: new Date('2026-04-07T10:00:00'),
      endTime: new Date('2026-04-07T11:00:00'),
      location: '会议室 A',
      attendees: JSON.stringify([
        { email: 'demo@planrea.app', name: '张三', status: 'ACCEPTED' },
        { email: 'colleague@company.com', name: '李四', status: 'ACCEPTED' }
      ]),
      status: 'CONFIRMED',
    }
  })
  console.log('✅ 创建日历事件')

  // ========== 7. 创建日程表 ==========
  const schedule = await prisma.schedule.create({
    data: {
      userId: user.id,
      title: '周一高效日程',
      description: '基于精力曲线的最优任务安排',
      startDate: new Date('2026-04-07T09:00:00'),
      endDate: new Date('2026-04-07T18:00:00'),
      status: 'CONFIRMED',
      aiModel: 'gpt-4',
      aiPrompt: '根据用户的高精力时段安排高难度任务，低精力时段安排简单任务',
      totalTasks: 4,
      totalMinutes: 420,
      confirmedAt: new Date('2026-04-06T20:00:00'),
    }
  })
  console.log('✅ 创建日程表')

  // ========== 8. 创建时间块 ==========
  const dbTask = tasks[3] // 完成数据库 Schema 设计
  const docTask = tasks[4] // 撰写产品文档
  
  await Promise.all([
    prisma.timeBlock.create({
      data: {
        scheduleId: schedule.id,
        taskId: dbTask.id,
        startTime: new Date('2026-04-07T09:00:00'),
        endTime: new Date('2026-04-07T12:00:00'),
        blockType: 'TASK',
        status: 'SCHEDULED',
        aiReasoning: '用户上午精力最佳，适合进行高难度的数据库设计工作',
      }
    }),
    prisma.timeBlock.create({
      data: {
        scheduleId: schedule.id,
        startTime: new Date('2026-04-07T12:00:00'),
        endTime: new Date('2026-04-07T13:00:00'),
        blockType: 'BREAK',
        status: 'SCHEDULED',
        aiReasoning: '午餐休息时间',
      }
    }),
    prisma.timeBlock.create({
      data: {
        scheduleId: schedule.id,
        taskId: meetingTask.id,
        startTime: new Date('2026-04-07T10:00:00'),
        endTime: new Date('2026-04-07T11:00:00'),
        blockType: 'FIXED',
        status: 'SCHEDULED',
        aiReasoning: '固定会议时间，不可调整',
      }
    }),
    prisma.timeBlock.create({
      data: {
        scheduleId: schedule.id,
        taskId: docTask.id,
        startTime: new Date('2026-04-07T14:00:00'),
        endTime: new Date('2026-04-07T17:00:00'),
        blockType: 'TASK',
        status: 'SCHEDULED',
        aiReasoning: '下午时段适合进行创意性写作工作',
      }
    }),
    prisma.timeBlock.create({
      data: {
        scheduleId: schedule.id,
        startTime: new Date('2026-04-07T17:00:00'),
        endTime: new Date('2026-04-07T17:30:00'),
        blockType: 'BUFFER',
        status: 'SCHEDULED',
        aiReasoning: '缓冲时间，处理突发事项',
      }
    }),
  ])
  console.log('✅ 创建时间块')

  // ========== 9. 创建行为模式 ==========
  await Promise.all([
    prisma.behaviorPattern.create({
      data: {
        userId: user.id,
        patternType: 'PRODUCTIVITY_PEAK',
        patternKey: 'MORNING',
        patternValue: 8.5,
        sampleSize: 30,
        confidence: 0.85,
        dateFrom: new Date('2026-03-01'),
        dateTo: new Date('2026-04-01'),
        aiInsight: '用户上午 9-12 点效率最高，建议安排重要且复杂的任务',
      }
    }),
    prisma.behaviorPattern.create({
      data: {
        userId: user.id,
        patternType: 'PRODUCTIVITY_PEAK',
        patternKey: 'AFTERNOON',
        patternValue: 6.2,
        sampleSize: 30,
        confidence: 0.78,
        dateFrom: new Date('2026-03-01'),
        dateTo: new Date('2026-04-01'),
        aiInsight: '下午效率有所下降，适合处理会议和沟通类任务',
      }
    }),
    prisma.behaviorPattern.create({
      data: {
        userId: user.id,
        patternType: 'CATEGORY_PREFERENCE',
        patternKey: 'STUDY',
        patternValue: 0.85,
        sampleSize: 20,
        confidence: 0.72,
        dateFrom: new Date('2026-03-01'),
        dateTo: new Date('2026-04-01'),
        metadata: { completedRate: 0.85, avgDuration: 90 },
      }
    }),
    prisma.behaviorPattern.create({
      data: {
        userId: user.id,
        patternType: 'ENERGY_PATTERN',
        patternKey: 'POST_LUNCH',
        patternValue: 4.0,
        sampleSize: 25,
        confidence: 0.80,
        dateFrom: new Date('2026-03-01'),
        dateTo: new Date('2026-04-01'),
        aiInsight: '午饭后精力明显下降，建议安排休息或简单任务',
      }
    }),
  ])
  console.log('✅ 创建行为模式')

  // ========== 10. 创建精力日志 ==========
  await Promise.all([
    prisma.energyLog.create({
      data: {
        userId: user.id,
        loggedAt: new Date('2026-04-06T09:00:00'),
        energyLevel: 'HIGH',
        fatigueLevel: 2,
        sleepHours: 7.5,
        sleepQuality: 4,
        caffeineMg: 150,
        mealStatus: '餐后1小时',
        exerciseDone: false,
        mood: '积极',
        stressLevel: 3,
        notes: '昨晚睡眠质量不错，今天早上精神状态很好',
      }
    }),
    prisma.energyLog.create({
      data: {
        userId: user.id,
        loggedAt: new Date('2026-04-06T14:00:00'),
        energyLevel: 'MEDIUM',
        fatigueLevel: 3,
        sleepHours: 7.5,
        mealStatus: '午餐后',
        exerciseDone: false,
        mood: '平静',
        stressLevel: 2,
        notes: '午饭后有点困，但还能正常工作',
      }
    }),
    prisma.energyLog.create({
      data: {
        userId: user.id,
        loggedAt: new Date('2026-04-06T17:00:00'),
        energyLevel: 'LOW',
        fatigueLevel: 4,
        mealStatus: '空腹',
        exerciseDone: false,
        mood: '疲惫',
        stressLevel: 3,
        notes: '下午工作强度大，感到比较疲惫',
      }
    }),
  ])
  console.log('✅ 创建精力日志')

  console.log('\n🎉 所有测试数据填充完成！')
  console.log('\n📊 数据概览:')
  console.log(`   - 用户: 1`)
  console.log(`   - 用户偏好: 1`)
  console.log(`   - 计划: ${plans.length}`)
  console.log(`   - 任务: ${tasks.length}`)
  console.log(`   - 任务依赖: 2`)
  console.log(`   - 日历连接: 1`)
  console.log(`   - 日历事件: 1`)
  console.log(`   - 日程表: 1`)
  console.log(`   - 时间块: 5`)
  console.log(`   - 行为模式: 4`)
  console.log(`   - 精力日志: 3`)
}

main()
  .catch((e) => {
    console.error('❌ 填充数据时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
