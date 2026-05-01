export async function printHtml(html) {
  if (window.bayaroDesktop?.printHtml) {
    const result = await window.bayaroDesktop.printHtml(html);
    if (!result?.ok) {
      throw new Error(result?.message || "Printer oynasi ochilmadi");
    }
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    throw new Error("Print oynasi bloklandi");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
