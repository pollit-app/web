import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import parseBillHistoryRows from "../scraper/billHistory/billHistoryParser";
import requestModal from "../scraper/billHistory/requestModal";
import { loadRowIds } from "../scraper/billHistory/rowIds";

const OUTPUT_FILE = "./src/data/upload/output/bill_history_errors.json";

export default async function uploadBillHistory(prisma: PrismaClient) {
  // Parse each page
  const errors = [];
  let counter = 0;
  const rowIds = loadRowIds();

  for (const rowId of rowIds) {
    console.log("Loading", rowId);
    counter++;

    try {
      const modalRows = await requestModal(rowId);
      const billHistory = parseBillHistoryRows(modalRows);

      await prisma.bill.create({
        data: billHistory,
      });
      console.log("Loaded", rowId, billHistory.billNum);
    } catch (err) {
      errors.push(rowId);
      console.error("Error", err);
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(errors, null, 2));
  console.log(errors);
  console.log("Done");
}
