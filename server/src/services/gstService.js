/**
 * Indian GST & Legal Tax Utility Engine (SAC Code 998211)
 * Handles Intra-state (CGST 9% + SGST 9%) and Inter-state (IGST 18%) tax logic
 * as well as TDS Section 194J (10% Tax Deducted at Source for professional fees).
 */

const SAC_LEGAL_SERVICES = '998211';
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;
const IGST_RATE = 0.18;
const TDS_194J_RATE = 0.10;

function calculateGST(subtotal, isInterState = false) {
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = subtotal * IGST_RATE;
  } else {
    cgst = subtotal * CGST_RATE;
    sgst = subtotal * SGST_RATE;
  }

  const totalTax = cgst + sgst + igst;
  const totalAmount = subtotal + totalTax;
  const tdsAmount = subtotal * TDS_194J_RATE;
  const netPayable = totalAmount - tdsAmount;

  return {
    sacCode: SAC_LEGAL_SERVICES,
    subtotal: Number(subtotal.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    tdsAmount: Number(tdsAmount.toFixed(2)),
    netPayable: Number(netPayable.toFixed(2)),
  };
}

module.exports = {
  SAC_LEGAL_SERVICES,
  calculateGST,
};
