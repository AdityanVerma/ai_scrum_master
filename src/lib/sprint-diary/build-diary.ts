import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getOvertimeDays } from '@/lib/sprint-status';
import {
  formatOvertimeLine,
  formatPerson,
  formatTimeOff,
  type DiaryParts,
  type DiaryTask,
} from '@/lib/sprint-diary/format';

const listInclude = {
  tasks: {
    orderBy: { order: 'asc' },
    include: {
      sprintTask: {
        select: {
          id: true,
          estimatedHours: true,
          sprint: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.DailyTasklistInclude;

type DiaryList = Prisma.DailyTasklistGetPayload<{
  include: typeof listInclude;
}>;
type ListTask = DiaryList['tasks'][number];

// The diary date at local midnight, for getOvertimeDays, which compares
// calendar days in local time.
function toLocalDay(date: string) {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

// Builds the generated parts of the diary for a date ("YYYY-MM-DD"):
// overtime sprints, each active member's Yesterday and Today, and upcoming
// time off (DAILY_SPRINT_DIARY_DESIGN.md section 3).
export async function buildDiaryParts(date: string): Promise<DiaryParts> {
  const day = new Date(date);

  // Overtime: active sprints past their end date on the diary date.
  const activeSprints = await prisma.sprint.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      status: true,
      endDate: true,
      tasks: { select: { status: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  const overtime = activeSprints
    .map((sprint) => ({
      ...sprint,
      daysOver: getOvertimeDays(sprint, toLocalDay(date)),
    }))
    .filter((sprint) => sprint.daysOver > 0);

  const overtimeSprintIds = new Set(overtime.map((sprint) => sprint.id));

  // People: Yesterday is the latest list before the date (Monday shows
  // Friday, days off are skipped); Today is the list for the date.
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const memberLists: {
    member: (typeof members)[number];
    yesterday: DiaryList | null;
    today: DiaryList | null;
  }[] = [];

  for (const member of members) {
    memberLists.push({
      member,
      yesterday: await prisma.dailyTasklist.findFirst({
        where: { memberId: member.id, date: { lt: day } },
        orderBy: { date: 'desc' },
        include: listInclude,
      }),
      today: await prisma.dailyTasklist.findUnique({
        where: { memberId_date: { memberId: member.id, date: day } },
        include: listInclude,
      }),
    });
  }

  const lists = memberLists.flatMap((item) =>
    [item.yesterday, item.today].filter(
      (list): list is DiaryList => list !== null,
    ),
  );
  const mainTasks = lists.flatMap((list) =>
    list.tasks.filter((task) => !task.parentTaskId),
  );

  // Totals for linked tasks: all time logged against the sprint task, by
  // anyone, up to the day of the line.
  const linkedRows = await prisma.tasklistTask.findMany({
    where: {
      sprintTaskId: {
        in: unique(
          mainTasks.flatMap((task) =>
            task.sprintTaskId ? [task.sprintTaskId] : [],
          ),
        ),
      },
      parentTaskId: null,
    },
    select: {
      sprintTaskId: true,
      spentMins: true,
      tasklistId: true,
      tasklist: { select: { date: true } },
    },
  });

  // Totals for unlinked work with a total estimate: the carry-over chain
  // (yesterday's task → today's copy), followed back one day per query.
  const chain = new Map<
    string,
    { carriedForwardFromId: string | null; spentMins: number | null }
  >();
  let pending = unique(
    mainTasks.flatMap((task) =>
      !task.sprintTaskId && task.totalEstimateMins && task.carriedForwardFromId
        ? [task.carriedForwardFromId]
        : [],
    ),
  );

  for (let depth = 0; pending.length > 0 && depth < 400; depth++) {
    const rows = await prisma.tasklistTask.findMany({
      where: { id: { in: pending } },
      select: { id: true, carriedForwardFromId: true, spentMins: true },
    });

    for (const row of rows) chain.set(row.id, row);

    pending = unique(
      rows.flatMap((row) =>
        row.carriedForwardFromId && !chain.has(row.carriedForwardFromId)
          ? [row.carriedForwardFromId]
          : [],
      ),
    );
  }

  function toDiaryTasks(list: DiaryList): DiaryTask[] {
    const subtasksOf = (task: ListTask) =>
      list.tasks
        .filter((subtask) => subtask.parentTaskId === task.id)
        .sort((a, b) => a.order - b.order);

    // Time spent if the day was ended with time, otherwise the plan (a task
    // with subtasks counts as the sum of its subtasks).
    const dayMinsOf = (task: ListTask) => {
      const subtasks = subtasksOf(task);
      const planned =
        subtasks.length > 0
          ? subtasks.reduce(
              (total, subtask) => total + subtask.estimatedMins,
              0,
            )
          : task.estimatedMins;

      return task.spentMins ?? planned;
    };

    const mains = list.tasks.filter((task) => !task.parentTaskId);

    return mains.map((task) => {
      const dayMins = dayMinsOf(task);
      let totals: DiaryTask['totals'] = null;

      if (task.sprintTask) {
        const sprintTaskId = task.sprintTask.id;
        const sameDay = mains
          .filter((item) => item.sprintTaskId === sprintTaskId)
          .reduce((total, item) => total + dayMinsOf(item), 0);
        const elsewhere = linkedRows
          .filter(
            (row) =>
              row.sprintTaskId === sprintTaskId &&
              row.tasklistId !== list.id &&
              row.tasklist.date <= list.date,
          )
          .reduce((total, row) => total + (row.spentMins ?? 0), 0);

        totals = {
          spentMins: sameDay + elsewhere,
          estimateMins: Math.round(task.sprintTask.estimatedHours * 60),
        };
      } else if (task.totalEstimateMins) {
        let spentMins = dayMins;
        let previousId = task.carriedForwardFromId;
        const seen = new Set<string>();

        while (previousId && !seen.has(previousId)) {
          seen.add(previousId);

          const previous = chain.get(previousId);

          if (!previous) break;

          spentMins += previous.spentMins ?? 0;
          previousId = previous.carriedForwardFromId;
        }

        totals = { spentMins, estimateMins: task.totalEstimateMins };
      }

      return {
        category: task.category,
        title: task.title,
        dayMins,
        totals,
        subtasks: subtasksOf(task).map((subtask) => ({
          title: subtask.title,
          mins: subtask.estimatedMins,
        })),
        overtimeSprint:
          task.sprintTask && overtimeSprintIds.has(task.sprintTask.sprint.id)
            ? task.sprintTask.sprint.name
            : null,
      };
    });
  }

  // Time off: who is off on the diary date, and everything not over yet.
  const timeOff = await prisma.timeOff.findMany({
    where: { endDate: { gte: day }, member: { isActive: true } },
    include: { member: { select: { id: true, name: true } } },
    orderBy: [{ startDate: 'asc' }, { member: { name: 'asc' } }],
  });

  const offToday = new Map(
    timeOff
      .filter((entry) => entry.startDate <= day)
      .map((entry) => [entry.member.id, entry.type]),
  );

  const people = memberLists.map(({ member, yesterday, today }) =>
    formatPerson(
      {
        name: member.name,
        yesterday: yesterday
          ? {
              date: yesterday.date.toISOString(),
              tasks: toDiaryTasks(yesterday),
            }
          : null,
        today: today ? { tasks: toDiaryTasks(today) } : null,
        todayOff: offToday.get(member.id) ?? null,
      },
      date,
    ),
  );

  return {
    overtimeLines: overtime.map((sprint) =>
      formatOvertimeLine({
        name: sprint.name,
        daysOver: sprint.daysOver,
        unfinishedTasks: sprint.tasks.filter((task) => task.status !== 'DONE')
          .length,
      }),
    ),
    people: people.join('\n\n'),
    timeOff: formatTimeOff(
      timeOff.map((entry) => ({
        name: entry.member.name,
        type: entry.type,
        startDate: entry.startDate.toISOString(),
        endDate: entry.endDate.toISOString(),
        note: entry.note,
      })),
    ),
  };
}
