// Shared by API routes and pages, so it must not import Prisma.

// Completed and cancelled sprints are history: their details and tasks
// cannot be changed.
export function isSprintLocked(status: string) {
  return status === 'COMPLETED' || status === 'CANCELLED';
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Days an ACTIVE sprint has run past its end date, 0 when it has not.
// The end date is stored as midnight UTC of the sprint's last day and the
// sprint runs through that whole day, so overtime starts the next calendar day.
export function getOvertimeDays(
  sprint: { status: string; endDate: string | Date },
  today = new Date(),
) {
  if (sprint.status !== 'ACTIVE') {
    return 0;
  }

  const end = new Date(sprint.endDate);
  const endDay = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  const currentDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.max(0, Math.round((currentDay - endDay) / DAY_MS));
}
