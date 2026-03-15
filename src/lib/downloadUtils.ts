import html2canvas from "html2canvas";

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAsImage(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    backgroundColor: "#0B0F19",
    scale: 2,
    useCORS: true,
  });
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.png`;
  a.click();
}
