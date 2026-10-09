import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export async function downloadElementAsPDF(
  element: HTMLElement,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Generate high-resolution image using browser native renderer (supports oklch, gradients & SVGs)
    const imgData = await toJpeg(element, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    // 2. Load image dimensions to scale to A4 proportionally
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgData;
    });

    // 3. Create A4 PDF with jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (img.height * pageWidth) / img.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add additional pages if document is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // 4. Trigger download with anchor & Blob (bypasses iframe restrictions)
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);

    return { success: true };
  } catch (err: any) {
    console.error('PDF generation error:', err);
    // Safe fallback: try window.print if environment permits, without throwing unhandled error
    try {
      window.print();
    } catch {
      // Ignored if sandboxed
    }
    return { success: false, error: err?.message || 'Download failed' };
  }
}
