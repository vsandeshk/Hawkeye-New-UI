import { Injectable ,ElementRef } from '@angular/core';
import * as FileSaver from 'file-saver';
const CSV_EXTENSION = '.csv';
const CSV_TYPE = 'text/plain;charset=utf-8';
import * as XLSX from 'xlsx';

const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }


  /**
   * Creates excel from the table element reference.
   *
   * @param element DOM table element reference.
   * @param fileName filename to save as.
   */
   public exportTableElmToExcel(element: ElementRef, fileName: string): void {
     console.log(element);
     console.log(element.nativeElement);

    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element.nativeElement);
    // generate workbook and add the worksheet
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
    // save to file
    XLSX.writeFile(workbook, `${fileName}${EXCEL_EXTENSION}`);

  }



}
