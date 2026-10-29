import download from "downloadjs";
import loadPdf from "./pdfLoader";
import fillPdfFields from "./fillPdfFields";

const GenerateFilledPDF = async function (btnType, formData, pagesKept) {
  // Fetch the PDF with form field
  const { pdfDoc, form } = await loadPdf();
  // Fill in the pdf fields
  fillPdfFields(form, formData);

  // Remove unneccessary pages
  let shift = 0;
  const totalPages = pdfDoc.getPageCount();
  let pagesKeptArray = pagesKept.split(",");

  // Check if pagesKept is empty or undefined
  if (!pagesKept || pagesKept.trim() === "") {
    // If pagesKept is empty, render the full PDF
    pagesKeptArray = Array.from({ length: totalPages }, (_, i) => i.toString());
  }

  for (let i = 0; i < totalPages; i++) {
    if (!pagesKeptArray.includes(i.toString())) {
      pdfDoc.removePage(i - shift);
      shift++;
    }
  }

  // Rearrange pages
  const genInstrutPages = pagesKeptArray.splice(0, 2);
  pagesKeptArray.splice(2, 0, genInstrutPages[0], genInstrutPages[1]);

  const reorderPages = (pdfDoc, newOrder) => {
    const pages = pdfDoc.getPages();
    for (let currentPage = 0; currentPage < newOrder.length; currentPage++) {
      pdfDoc.removePage(currentPage);
      pdfDoc.insertPage(currentPage, pages[newOrder[currentPage]]);
    }
  };

  reorderPages(pdfDoc, pagesKeptArray);

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  if (btnType === "newTab") {
    // Trigger the browser to open a new tab with the PDF document
    var blobURL = URL.createObjectURL(
      new Blob([pdfBytes], { type: "application/pdf" }),
    );
    window.open(blobURL);
  } else if (btnType === "download") {
    // Trigger the browser to download the PDF document
    download(
      pdfBytes,
      `national_voter_registration_form_${formData.state}.pdf`,
      "application/pdf",
    );
  }
};

export default GenerateFilledPDF;
