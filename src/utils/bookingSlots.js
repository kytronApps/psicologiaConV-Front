export function getAvailableSlots({
  date,
  availability,
  appointments,
  duration = 50,
  excludeAppointmentId = null,
}) {
  if (!date || !availability.days.includes(new Date(`${date}T12:00:00`).getDay())) {
    return [];
  }

  const toMinutes = (value) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };
  const format = (minutes) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  const existing = appointments.filter(
    (item) =>
      item.id !== excludeAppointmentId &&
      item.date === date &&
      item.status !== "cancelled",
  );
  const slots = [];
  const start = toMinutes(availability.start);
  const end = toMinutes(availability.end);

  for (let candidate = start; candidate + duration <= end; candidate += 60) {
    const candidateEnd = candidate + duration;
    const overlaps = existing.some((item) => {
      const itemStart = toMinutes(item.time);
      const itemEnd = itemStart + Number(item.duration || 50);
      return candidate < itemEnd && candidateEnd > itemStart;
    });
    if (!overlaps) slots.push(format(candidate));
  }
  return slots;
}
