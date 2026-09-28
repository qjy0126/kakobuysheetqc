/**
 * Open YOUR sheet:
 * https://docs.google.com/spreadsheets/d/1ouCVXknU6RYgA1bhcB0g3cPV3yr0a210C4q7IWd1DOc/edit
 *
 * Extensions → Apps Script → paste this file → Save.
 * Select the product tab, then run hideSheetBlankArea first.
 */

function hideSheetBlankArea() {
  const sh = SpreadsheetApp.getActiveSheet();
  const maxCol = sh.getMaxColumns();
  const maxRow = sh.getMaxRows();
  let usedCol = Math.max(sh.getLastColumn(), 1);
  const usedRow = Math.max(sh.getLastRow(), 1);
  const CREAM = "#FBF8F8";

  // Drop the leftover "Google gid" column if it is the last used column.
  const lastHeader = String(sh.getRange(2, usedCol).getDisplayValue() || "");
  if (usedCol > 1 && /google gid/i.test(lastHeader)) {
    usedCol -= 1;
  }

  sh.setHiddenGridlines(true);
  sh.showColumns(1, maxCol);
  sh.showRows(1, maxRow);

  if (usedCol < maxCol) {
    sh.hideColumns(usedCol + 1, maxCol - usedCol);
  }

  const keepRows = Math.min(maxRow, usedRow + 2);
  if (keepRows < maxRow) {
    sh.hideRows(keepRows + 1, maxRow - keepRows);
  }

  // Widen remaining columns so they fill a typical laptop/desktop window.
  const fillWidth = 1680;
  const colWidth = Math.max(120, Math.floor(fillWidth / usedCol));
  sh.setColumnWidths(1, usedCol, colWidth);

  sh.getRange(1, 1, keepRows, usedCol).setBackground(CREAM);
  sh.setFrozenRows(Math.min(3, usedRow));
  sh.setTabColor("#FB2840");
}

function styleKakobuySheetCover() {
  hideSheetBlankArea();
  const sh = SpreadsheetApp.getActiveSheet();
  const PINK = "#FB2840";
  const PINK_DARK = "#D91B33";
  const INK = "#1A1214";
  const CREAM = "#FBF8F8";
  const WHITE = "#FFFFFF";

  sh.insertRowsBefore(1, 4);
  sh.setColumnWidths(1, Math.min(9, sh.getLastColumn() || 9), 118);
  sh.setRowHeight(1, 64);
  sh.setRowHeight(2, 36);
  sh.setRowHeight(3, 48);
  sh.setRowHeight(4, 28);

  const banner = sh.getRange("A1:I1");
  banner.merge();
  banner.setBackground(PINK);
  banner.setFontColor(WHITE);
  banner.setFontFamily("Arial");
  banner.setFontSize(12);
  banner.setFontWeight("bold");
  banner.setWrap(true);
  banner.setVerticalAlignment("middle");
  banner.setHorizontalAlignment("center");
  banner.setValue(
    "Sheet is slow with thousands of photos? Browse the catalog instead — kakobuysheetqc.com"
  );

  const note = sh.getRange("A2:I2");
  note.merge();
  note.setBackground(CREAM);
  note.setFontColor(INK);
  note.setFontSize(10);
  note.setHorizontalAlignment("center");
  note.setVerticalAlignment("middle");
  note.setValue(
    "Informational directory only. Links go to Weidian / Taobao / 1688. Checkout stays on Kakobuy."
  );

  const cats = sh.getRange("A3:I3");
  cats.merge();
  cats.setBackground(PINK_DARK);
  cats.setFontColor(WHITE);
  cats.setFontSize(18);
  cats.setFontWeight("bold");
  cats.setHorizontalAlignment("center");
  cats.setVerticalAlignment("middle");
  cats.setValue("CATEGORIES");

  sh.getRange("A4:I4")
    .setBackground(PINK)
    .setFontColor(WHITE)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setValues([[
      "Shoes",
      "Tops",
      "Hoodies",
      "Jackets",
      "Pants",
      "Bags",
      "Hats",
      "Watches",
      "Other",
    ]]);

  sh.setFrozenRows(4);
}
