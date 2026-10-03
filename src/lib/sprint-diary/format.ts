// Text of the Daily Sprint Diary, in the format the team posts in Google Chat
// (see _docs_/PLAN/DAILY_SPRINT_DIARY_DESIGN.md). Pure functions with no
// Prisma, so the diary page can rebuild the preview while the header is typed.

export const DIARY_STATUSES = ['RED', 'ORANGE', 'GREEN'] as const;

export type DiaryStatus = (typeof DIARY_STATUSES)[number];

export type DiaryHeader = {
  phase: string;
  macroScope: string;
  microScope: string;
  status: DiaryStatus | null;
};

// The generated parts, as built on the server for one date.
export type DiaryParts = {
  overtimeLines: string[];
  people: string;
  timeOff: string;
};

export const DIARY_SEPARATOR = '_'.repeat(60);

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-10-03" → "Oct 3". Dates are calendar days, so they are read in UTC.
export function formatDiaryDate(date: string) {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    },
  );
}

// "2026-10-06" to "2026-10-08" → "Oct 6 to Oct 8"; one day → "Oct 6".
export function formatDiaryRange(startDate: string, endDate: string) {
  const start = formatDiaryDate(startDate);
  const end = formatDiaryDate(endDate);

  return start === end ? start : `${start} to ${end}`;
}

// 120 → "2hr", 90 → "1hr 30min", 30 → "30min", 0 → "0hr".
export function formatDiaryTime(mins: number) {
  const rounded = Math.round(mins);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  if (hours === 0 && minutes > 0) return `${minutes}min`;

  return minutes === 0 ? `${hours}hr` : `${hours}hr ${minutes}min`;
}

export type DiaryTask = {
  category: string;
  title: string;
  // Time spent that day if logged, otherwise the planned time.
  dayMins: number;
  // [total spent / total estimate] across days, when known.
  totals: { spentMins: number; estimateMins: number } | null;
  // Subtasks with their planned time (time is logged on main tasks only).
  subtasks: { title: string; mins: number }[];
  // Set when the linked sprint is past its end date and still active.
  overtimeSprint: string | null;
};

export type DiaryPerson = {
  name: string;
  // The person's latest tasklist before the diary date.
  yesterday: { date: string; tasks: DiaryTask[] } | null;
  // The tasklist for the diary date.
  today: { tasks: DiaryTask[] } | null;
  // Time off covering the diary date, shown when there is no list.
  todayOff: 'LEAVE' | 'PUBLIC_HOLIDAY' | null;
};

// "1. [Development] Polls - 2hr [5hr/8hr]" plus "1.1 Subtask - 1hr" lines.
function formatTask(number: number, task: DiaryTask) {
  const totals = task.totals
    ? ` [${formatDiaryTime(task.totals.spentMins)}/${formatDiaryTime(task.totals.estimateMins)}]`
    : '';

  return [
    `${number}. [${task.category}] ${task.title} - ${formatDiaryTime(task.dayMins)}${totals}`,
    ...task.subtasks.map(
      (subtask, index) =>
        `${number}.${index + 1} ${subtask.title} - ${formatDiaryTime(subtask.mins)}`,
    ),
  ];
}

// Tasks in list order; work for a sprint in overtime goes last, under
// "## [Overtime] Sprint 16", numbered on from the rest.
function formatTasks(tasks: DiaryTask[]) {
  const lines: string[] = [];
  let number = 0;

  for (const task of tasks.filter((item) => !item.overtimeSprint)) {
    lines.push(...formatTask(++number, task));
  }

  const overtimeSprints = [
    ...new Set(
      tasks.flatMap((task) =>
        task.overtimeSprint ? [task.overtimeSprint] : [],
      ),
    ),
  ];

  for (const sprint of overtimeSprints) {
    if (lines.length > 0) lines.push('');

    lines.push(`## [Overtime] ${sprint}`);

    for (const task of tasks.filter((item) => item.overtimeSprint === sprint)) {
      lines.push(...formatTask(++number, task));
    }
  }

  return lines;
}

const OFF_LABELS = { LEAVE: '[Leave]', PUBLIC_HOLIDAY: '[Public holiday]' };

export function formatPerson(person: DiaryPerson, diaryDate: string) {
  const lines = [`${person.name}:`];

  if (!person.yesterday) {
    lines.push('Yesterday [No tasklist]');
  } else {
    // The date is shown unless the list is from the day before, e.g. Monday
    // shows Friday's list as "Yesterday (Oct 3)".
    const dayBefore = new Date(
      new Date(`${diaryDate}T00:00:00Z`).getTime() - DAY_MS,
    )
      .toISOString()
      .slice(0, 10);
    const label =
      person.yesterday.date.slice(0, 10) === dayBefore
        ? 'Yesterday'
        : `Yesterday (${formatDiaryDate(person.yesterday.date)})`;

    if (person.yesterday.tasks.length === 0) {
      lines.push(`${label} [No tasks]`);
    } else {
      lines.push(label, ...formatTasks(person.yesterday.tasks));
    }
  }

  lines.push('');

  if (person.today && person.today.tasks.length > 0) {
    lines.push('Today', ...formatTasks(person.today.tasks));
  } else if (person.todayOff) {
    lines.push(`Today ${OFF_LABELS[person.todayOff]}`);
  } else {
    lines.push('Today [To be updated]');
  }

  return lines.join('\n');
}

export type DiaryTimeOff = {
  name: string;
  type: 'LEAVE' | 'PUBLIC_HOLIDAY';
  startDate: string;
  endDate: string;
  note: string | null;
};

// "Public Holiday" lines group everyone off on the same days ("A, B - Oct 2
// (Gandhi Jayanti)"); "Leave" has one line per entry. Leave notes are not
// shown, as they can be personal.
export function formatTimeOff(entries: DiaryTimeOff[]) {
  const holidays = new Map<string, { names: string[]; line: string }>();

  for (const entry of entries.filter(
    (item) => item.type === 'PUBLIC_HOLIDAY',
  )) {
    const range = formatDiaryRange(entry.startDate, entry.endDate);
    const line = entry.note ? `${range} (${entry.note})` : range;
    const key = `${entry.startDate}|${entry.endDate}|${entry.note ?? ''}`;
    const group = holidays.get(key) ?? { names: [], line };

    group.names.push(entry.name);
    holidays.set(key, group);
  }

  const leave = entries
    .filter((item) => item.type === 'LEAVE')
    .map(
      (entry) =>
        `${entry.name} - ${formatDiaryRange(entry.startDate, entry.endDate)}`,
    );

  const lines: string[] = [];

  if (holidays.size > 0) {
    lines.push(
      'Public Holiday',
      ...[...holidays.values()].map(
        (group) => `${group.names.join(', ')} - ${group.line}`,
      ),
    );
  }

  if (leave.length > 0) {
    lines.push('Leave', ...leave);
  }

  return lines.join('\n');
}

// "[Overtime] Sprint 16 - 6 days over, 4 unfinished tasks"
export function formatOvertimeLine(sprint: {
  name: string;
  daysOver: number;
  unfinishedTasks: number;
}) {
  const days = `${sprint.daysOver} ${sprint.daysOver === 1 ? 'day' : 'days'}`;
  const tasks = `${sprint.unfinishedTasks} unfinished ${sprint.unfinishedTasks === 1 ? 'task' : 'tasks'}`;

  return `[Overtime] ${sprint.name} - ${days} over, ${tasks}`;
}

function clean(text: string) {
  return text.replace(/\r\n/g, '\n').trim();
}

// The whole diary. Empty header parts are left out; the page warns before
// publishing an incomplete header.
export function assembleDiary(
  date: string,
  header: DiaryHeader,
  parts: DiaryParts,
) {
  const blocks: string[] = [];
  const phase = clean(header.phase);
  const macroScope = clean(header.macroScope);
  const microScope = [...parts.overtimeLines, clean(header.microScope)]
    .filter(Boolean)
    .join('\n');

  if (phase) blocks.push(phase);
  if (macroScope) blocks.push(`MACRO-SCOPE - Phase level\n${macroScope}`);
  if (microScope) blocks.push(`MICRO-SCOPE - Sprint level\n${microScope}`);
  if (header.status) blocks.push(`STATUS : ${header.status}`);
  if (parts.people) blocks.push(parts.people);
  if (parts.timeOff) blocks.push(parts.timeOff);

  return [`Sprint Diary: ${formatDiaryDate(date)}`, ...blocks].join(
    `\n${DIARY_SEPARATOR}\n`,
  );
}

// Header parts that are still empty, for the warning before publishing.
export function getMissingHeaderParts(header: DiaryHeader) {
  return [
    !clean(header.phase) && 'phase',
    !clean(header.macroScope) && 'macro scope',
    !clean(header.microScope) && 'micro scope',
    !header.status && 'status',
  ].filter((part): part is string => Boolean(part));
}
