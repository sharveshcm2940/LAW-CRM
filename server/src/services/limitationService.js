/**
 * Indian Limitation Act 1963 Statutory Calculator
 */

const LIMITATION_SCHEDULES = {
  CHEQUE_BOUNCE_NI_138: { actName: 'Negotiable Instruments Act 1881', days: 30 },
  CIVIL_APPEAL_HIGH_COURT: { actName: 'Code of Civil Procedure 1908 (CPC)', days: 90 },
  CIVIL_APPEAL_DISTRICT: { actName: 'Limitation Act 1963 Schedule I', days: 30 },
  MONEY_RECOVERY_SUIT: { actName: 'Limitation Act 1963 Article 19', days: 1095 }, // 3 years
  SPECIAL_LEAVE_PETITION: { actName: 'Supreme Court Rules 2013', days: 90 },
};

function calculateLimitationDeadline(scheduleKey, triggerDate) {
  const schedule = LIMITATION_SCHEDULES[scheduleKey] || LIMITATION_SCHEDULES.CIVIL_APPEAL_HIGH_COURT;
  const start = new Date(triggerDate);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + schedule.days);

  const today = new Date();
  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  let alertStatus = 'NORMAL';
  if (diffDays < 0) alertStatus = 'EXPIRED';
  else if (diffDays <= 7) alertStatus = 'CRITICAL';
  else if (diffDays <= 30) alertStatus = 'WARNING';

  return {
    actName: schedule.actName,
    statutoryDays: schedule.days,
    deadlineDate: deadline,
    daysRemaining: diffDays,
    alertStatus,
  };
}

module.exports = {
  LIMITATION_SCHEDULES,
  calculateLimitationDeadline,
};
