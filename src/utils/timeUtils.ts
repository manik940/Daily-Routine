export const parseTime = (timeStr: string, baseDate: Date = new Date()) => {
  try {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  } catch (e) {
    console.warn("parseTime error:", e);
    return null;
  }
};

export const formatTime = (time24: string) => {
  try {
    if (!time24 || typeof time24 !== 'string') return "";
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return time24;
    
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  } catch (e) {
    console.warn("formatTime error:", e);
    return time24;
  }
};

export const getBanglaDigits = (num: number | string) => {
  return num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
};

export const getBanglaDate = (date: Date = new Date()) => {
  const day = date.getDate();
  const month = date.getMonth();
  const dayOfWeek = date.getDay();
  const year = date.getFullYear();

  const banglaMonths = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];
  
  const banglaDays = [
    "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
  ];

  return `${banglaDays[dayOfWeek]}, ${getBanglaDigits(day)} ${banglaMonths[month]} ${getBanglaDigits(year)}`;
};
