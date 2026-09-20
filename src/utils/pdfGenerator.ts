import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Course, StudentProfile } from "../types";

export interface CertificateData {
  profile: StudentProfile;
  course: Course;
  certificateId: string;
  issueDate: string;
  is100Percent: boolean;
  completionScore?: number;
}

/**
 * Downloads a high-resolution, professionally formatted PDF certificate.
 * Uses html2canvas to capture visual DOM styling, with a native jsPDF vector fallback.
 */
export async function downloadCertificatePDF(
  element: HTMLElement | null,
  data: CertificateData
): Promise<boolean> {
  // Enforce strict completion integrity: No download allowed if course is incomplete
  if (!data.is100Percent) {
    console.warn("Certificate download prevented: Course is not 100% completed.");
    return false;
  }

  const sanitizedStudent = (data.profile.name || "Student").replace(/[^a-zA-Z0-9_-]/g, "_");
  const sanitizedCourse = (data.course.title || "Course").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Certificate_${sanitizedStudent}_${sanitizedCourse}.pdf`;

  // Attempt DOM-to-Canvas High-Res Capture first
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2.5, // Crisp 300dpi-like resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Landscape A4 dimensions: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 297;
      const pdfHeight = 210;

      // Maintain aspect ratio while fitting within margins
      const margin = 10;
      const maxWidth = pdfWidth - margin * 2;
      const maxHeight = pdfHeight - margin * 2;

      let renderWidth = maxWidth;
      let renderHeight = (canvas.height * renderWidth) / canvas.width;

      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = (canvas.width * renderHeight) / canvas.height;
      }

      const x = (pdfWidth - renderWidth) / 2;
      const y = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
      pdf.save(filename);
      return true;
    } catch (err) {
      console.warn("HTML2Canvas capture encountered an issue, falling back to jsPDF vector layout:", err);
    }
  }

  // Fallback: Direct vector drawing with jsPDF to guarantee download never fails
  try {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // Outer Background
    pdf.setFillColor(252, 253, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Double Border
    pdf.setDrawColor(79, 70, 229); // Indigo 600
    pdf.setLineWidth(2.5);
    pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

    pdf.setDrawColor(199, 210, 254); // Indigo 200
    pdf.setLineWidth(0.8);
    pdf.rect(16, 16, pageWidth - 32, pageHeight - 32);

    // Decorative corner accents
    pdf.setFillColor(79, 70, 229);
    pdf.rect(12, 12, 10, 10, "F");
    pdf.rect(pageWidth - 22, 12, 10, 10, "F");
    pdf.rect(12, pageHeight - 22, 10, 10, "F");
    pdf.rect(pageWidth - 22, pageHeight - 22, 10, 10, "F");

    // Header Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(30, 41, 59); // Slate 800
    pdf.text("VIRTUAL LEARNER ALMS", pageWidth / 2, 38, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(79, 70, 229);
    pdf.text("ADAPTIVE LEARNING MANAGEMENT SYSTEM • VERIFIED CREDENTIAL", pageWidth / 2, 45, { align: "center" });

    // Ribbon / Subtitle
    pdf.setFontSize(13);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.text("OFFICIAL CERTIFICATE OF ACADEMIC & TECHNICAL MASTERY", pageWidth / 2, 58, { align: "center" });

    pdf.setFontSize(11);
    pdf.text("This credential certifies that", pageWidth / 2, 70, { align: "center" });

    // Student Name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.setTextColor(15, 23, 42); // Slate 900
    pdf.text(data.profile.name || "Student Scholar", pageWidth / 2, 85, { align: "center" });

    // Underline
    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(0.7);
    pdf.line(pageWidth / 2 - 60, 89, pageWidth / 2 + 60, 89);

    // Body
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.text("has successfully completed all adaptive learning modules, interactive checkpoints,", pageWidth / 2, 100, { align: "center" });
    pdf.text("and AI-evaluated diagnostic assessments for the accredited curriculum:", pageWidth / 2, 106, { align: "center" });

    // Course Title Box
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(pageWidth / 2 - 90, 114, 180, 24, 3, 3, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(30, 41, 59);
    pdf.text(data.course.title, pageWidth / 2, 124, { align: "center" });

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Category: ${data.course.category}  •  Difficulty: ${data.course.difficulty}  •  ${data.course.durationHours} Estimated Hours`, pageWidth / 2, 132, { align: "center" });

    // Honors Badge
    pdf.setFillColor(236, 253, 245); // Emerald 50
    pdf.setDrawColor(167, 243, 208);
    pdf.roundedRect(pageWidth / 2 - 50, 144, 100, 10, 5, 5, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(5, 150, 105); // Emerald 600
    pdf.text("100% Mastery & Distinction Honors", pageWidth / 2, 150.5, { align: "center" });

    // Footer credentials and seals
    const footerY = 175;

    // Left block: Credential Details
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    pdf.text("Credential Verification", 35, footerY);

    pdf.setFont("courier", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`ID: ${data.certificateId}`, 35, footerY + 6);
    pdf.text(`Issued: ${data.issueDate}`, 35, footerY + 11);
    pdf.text(`Verification: Authenticated by VertexLearn AI`, 35, footerY + 16);

    // Right block: Academic Director Signature
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    pdf.text("Academic Directorship", pageWidth - 75, footerY);

    pdf.setDrawColor(148, 163, 184);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - 75, footerY + 10, pageWidth - 25, footerY + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Dr. Vertex, Lead Pedagogical Architect", pageWidth - 75, footerY + 15);

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error("Vector PDF generation failed:", err);
    return false;
  }
}
