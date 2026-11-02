export const convertDateFormat = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return ""; // If date is null or "0000-00-00", return empty string
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export const capitalizeWords = (str = "") => {
    if (typeof str !== "string") return "";
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

export const isScheduleExpired = (dateStr) => {
  if (!dateStr || dateStr === "0000-00-00") return true;

  let year, month, day;
  const cleanDateStr = String(dateStr).trim().substring(0, 10);
  
  if (cleanDateStr.includes('-')) {
    const parts = cleanDateStr.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (cleanDateStr.includes('/')) {
    const parts = cleanDateStr.split('/');
    if (parts[2].length === 4) {
      // DD/MM/YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    } else if (parts[0].length === 4) {
      // YYYY/MM/DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  }

  if (!year || isNaN(month) || !day) {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return true;
    year = parsed.getFullYear();
    month = parsed.getMonth();
    day = parsed.getDate();
  }

  const currentDateTime = new Date();

  // If the scheduled date is TODAY (any time today) -> ALWAYS ACTIVE & VISIBLE!
  if (
    day === currentDateTime.getDate() &&
    month === currentDateTime.getMonth() &&
    (year === currentDateTime.getFullYear() || year === currentDateTime.getFullYear() - 1)
  ) {
    return false;
  }

  // End of the scheduled day (23:59:59.999) - remains active throughout the whole day!
  const scheduleEndOfDay = new Date(year, month, day, 23, 59, 59, 999);

  // Expired only if the entire scheduled date has completely passed (strictly starting tomorrow)
  return scheduleEndOfDay.getTime() < currentDateTime.getTime();
};


