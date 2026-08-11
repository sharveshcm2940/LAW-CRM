/**
 * e-Courts & Cause List Reminder Notification Service Stub
 */

function sendHearingReminder(caseItem, hearing) {
  console.log(`[REMINDER STUB] Notification sent for Case ${caseItem.caseNumber} on ${hearing.hearingDate}`);
  return {
    sent: true,
    recipient: caseItem.leadLawyer?.email || 'advocate@lexos.in',
    caseNumber: caseItem.caseNumber,
    hearingDate: hearing.hearingDate,
    courtName: caseItem.courtName,
  };
}

module.exports = {
  sendHearingReminder,
};
