import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a PDF report for a single test result
 */
export function generateTestPDF(test) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246);
  doc.text('VMA Test Report', pageWidth / 2, 25, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 33, { align: 'center' });

  // Horizontal line
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 38, pageWidth - 20, 38);

  // Athlete Info
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Athlete Information', 20, 50);

  doc.autoTable({
    startY: 55,
    head: [],
    body: [
      ['Name', `${test.first_name} ${test.last_name}`],
      ['Age', `${test.age} years`],
      ['Gender', test.gender.charAt(0).toUpperCase() + test.gender.slice(1)],
      ['Weight', test.weight ? `${test.weight} kg` : 'N/A'],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] },
    },
  });

  // Test Results
  const afterAthleteY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Test Results', 20, afterAthleteY);

  doc.autoTable({
    startY: afterAthleteY + 5,
    head: [],
    body: [
      ['Test Type', test.test_type === 'cooper' ? 'Cooper (12 min)' : 'Demi-Cooper (6 min)'],
      ['Distance', `${test.distance_meters} m`],
      ['Stop Time', `${test.stop_time_seconds} s`],
      ['Walking Time', `${test.walking_time_seconds} s`],
      ['Effective Time', `${test.effective_time_seconds} s`],
      ['VMA', `${test.vma} km/h`],
      ['Level', `Level ${test.level} — ${test.level_label}`],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] },
    },
  });

  // Calculation Steps
  if (test.calculation_steps && test.calculation_steps.length > 0) {
    const afterResultsY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text('Calculation Steps', 20, afterResultsY);

    doc.autoTable({
      startY: afterResultsY + 5,
      head: [],
      body: test.calculation_steps.map((step) => [step]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3, textColor: [75, 85, 99] },
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('VMA Calculator — Cooper & Demi-Cooper Tests', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`vma-report-${test.first_name}-${test.last_name}.pdf`);
}

/**
 * Generate a PDF report for multiple test results
 */
export function generateBulkPDF(tests, title = 'VMA Test Results') {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`${tests.length} results — Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

  doc.autoTable({
    startY: 35,
    head: [['#', 'Name', 'Age', 'Gender', 'Test', 'Distance (m)', 'VMA (km/h)', 'Level']],
    body: tests.map((t, i) => [
      i + 1,
      `${t.first_name} ${t.last_name}`,
      t.age,
      t.gender,
      t.test_type,
      t.distance_meters,
      t.vma,
      `${t.level} — ${t.level_label}`,
    ]),
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
  });

  doc.save('vma-results-report.pdf');
}
