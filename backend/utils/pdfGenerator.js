const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path'); 
const fs = require('fs').promises;
const generateCertificatePDF = async (application, user) => {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // A4 size page (595 x 842 points)
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    
    // Embed fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    const emblemPath = path.join(__dirname, '../assets/emblem.png');
    const signaturePath = path.join(__dirname, '../assets/signature.png');
    const stampPath = path.join(__dirname, '../assets/stamp.png');

    const emblemImageBytes = await fs.readFile(emblemPath);
    const signatureImageBytes = await fs.readFile(signaturePath);
    const stampImageBytes = await fs.readFile(stampPath);

    const emblemImage = await pdfDoc.embedPng(emblemImageBytes);
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    const stampImage = await pdfDoc.embedPng(stampImageBytes);
    // Margins
    const marginLeft = 60;
    const marginRight = 60;
    
    let currentY = height - 60;

    // ============ OUTER BORDER ============
    page.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      borderWidth: 2,
      borderColor: rgb(0, 0, 0),
    });

    // Inner border
    page.drawRectangle({
      x: 45,
      y: 45,
      width: width - 90,
      height: height - 90,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    // ============ HEADER SECTION ============
    
    const emblemDims = emblemImage.scale(0.15); 
    page.drawImage(emblemImage, {
      x: width / 2 - emblemDims.width / 2,
      y: currentY - emblemDims.height,
      width: emblemDims.width,
      height: emblemDims.height,
    });

    currentY -= emblemDims.height + 15;

    // Government of Karnataka
    page.drawText('GOVERNMENT OF KARNATAKA', {
      x: width / 2 - 110,
      y: currentY-10,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;

    // Office name based on certificate type
    const officeName = getCertificateOffice(application.certificate_type);
    page.drawText(officeName, {
      x: width / 2 - (officeName.length * 3),
      y: currentY-10,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 15;

    // Certificate number
    const certNumber = `Certificate No: E-${application.id.substring(0, 8).toUpperCase()}/${new Date().getFullYear()}`;
    page.drawText(certNumber, {
      x: width / 2 - (certNumber.length * 2.5),
      y: currentY-10,
      size: 9,
      font: italicFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    currentY -= 25;

    // Horizontal line
    page.drawLine({
      start: { x: marginLeft, y: currentY },
      end: { x: width - marginRight, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    currentY -= 25;

    // ============ CERTIFICATE TITLE ============
    const certificateTitle = `${application.certificate_type.toUpperCase()}`;
    const titleWidth = certificateTitle.length * 7;
    
    page.drawText(certificateTitle, {
      x: width / 2 - titleWidth / 2,
      y: currentY,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    // ============ CERTIFICATE CONTENT ============
    
    // Introduction text
    const introText = `This is to certify that`;
    page.drawText(introText, {
      x: marginLeft,
      y: currentY,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 25;

    // Applicant name (bold and larger)
    page.drawText(application.full_name.toUpperCase(), {
      x: marginLeft + 20,
      y: currentY,
      size: 13,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;

    // Father's name
    const fatherText = `S/o, D/o, W/o: ${application.father_name}`;
    page.drawText(fatherText, {
      x: marginLeft,
      y: currentY,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;

    // Address
    page.drawText('Residing at:', {
      x: marginLeft,
      y: currentY,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 18;

    // Split address into multiple lines if too long
    const addressLines = splitTextIntoLines(application.address, 65);
    for (const line of addressLines) {
      page.drawText(line, {
        x: marginLeft + 20,
        y: currentY,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 16;
    }

    currentY -= 10;

    // Certificate specific content
    const certContent = getCertificateContent(application.certificate_type);
    const contentLines = splitTextIntoLines(certContent, 70);
    for (const line of contentLines) {
      page.drawText(line, {
        x: marginLeft,
        y: currentY,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 16;
    }

    currentY -= 10;

    // Aadhaar number
    page.drawText(`Aadhaar Number: ${user.aadhaar_number}`, {
      x: marginLeft,
      y: currentY,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 20;

    // Date of issue
    const issueDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    page.drawText(`Date of Issue: ${issueDate}`, {
      x: marginLeft,
      y: currentY,
      size: 10,
      font: italicFont,
      color: rgb(0, 0, 0),
    });
    currentY = 240;
    const signatureDims = signatureImage.scale(0.2); // Adjust scale as needed
    page.drawImage(signatureImage, {
      x: width - marginRight - 140,
      y: currentY + 10,
      width: signatureDims.width,
      height: signatureDims.height,
    });
    // Signature line
    page.drawLine({
      start: { x: width - marginRight - 150, y: currentY },
      end: { x: width - marginRight - 20, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    currentY -= 15;

    // Digitally signed text
    page.drawText('Digitally Signed by', {
      x: width - marginRight - 145,
      y: currentY,
      size: 9,
      font: italicFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 12;

    page.drawText('Tahsildar/Revenue Officer', {
      x: width - marginRight - 145,
      y: currentY,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    currentY -= 12;

    page.drawText('Government of Karnataka', {
      x: width - marginRight - 145,
      y: currentY,
      size: 8,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    const stampDims = stampImage.scale(0.18); // Adjust scale as needed
    page.drawImage(stampImage, {
      x: width - marginRight - 100,
      y: currentY - 70,
      width: stampDims.width,
      height: stampDims.height,
    });

    // ============ FOOTER SECTION ============
    
    // Horizontal line before footer
    page.drawLine({
      start: { x: marginLeft, y: 80 },
      end: { x: width - marginRight, y: 80 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Footer note
    const footerText = 'NOTE:';
    page.drawText(footerText, {
      x: marginLeft,
      y: 115,
      size: 8,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    const footerNote1 = '(i) This is digitally signed electronically generated certificate and does not require physical signature.';
    page.drawText(footerNote1, {
      x: marginLeft,
      y: 105,
      size: 7,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Application reference (blockchain data will be added later)
    const appRef = `Application ID: ${application.id} | Issued on: ${new Date().toLocaleDateString()}`;
    page.drawText(appRef, {
      x: marginLeft,
      y: 55,
      size: 6,
      font: italicFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};

// Helper function to get office name based on certificate type
const getCertificateOffice = (certificateType) => {
  const offices = {
    'Birth Certificate': 'Office of the Registrar of Births and Deaths',
    'Death Certificate': 'Office of the Registrar of Births and Deaths',
    'Marriage Certificate': 'Office of the Marriage Registrar',
    'Income Certificate': 'Office of the Tahsildar',
    'Caste Certificate': 'Office of the Deputy Commissioner',
    'Domicile Certificate': 'Office of the Tahsildar',
    'Character Certificate': 'Office of the Police Commissioner'
  };
  return offices[certificateType] || 'Office of the Tahsildar';
};

// Helper function to get certificate specific content
const getCertificateContent = (certificateType) => {
  const contents = {
    'Birth Certificate': 'is a citizen of India and their birth has been registered in the records maintained by the Government of Karnataka as per the Registration of Births and Deaths Act, 1969.',
    'Death Certificate': 'has been registered in the official records of deaths maintained by the Government of Karnataka under the Registration of Births and Deaths Act, 1969.',
    'Marriage Certificate': 'has been legally married as per the records maintained by the Government of Karnataka under the Hindu Marriage Act, 1955 / Special Marriage Act, 1954.',
    'Income Certificate': 'belongs to the economically weaker section and their annual family income does not exceed the prescribed limit as per Government of Karnataka norms.',
    'Caste Certificate': 'belongs to the Scheduled Caste/Scheduled Tribe/Other Backward Classes as recognized by the Government of Karnataka and is entitled to benefits and reservations.',
    'Domicile Certificate': 'is a permanent resident of Karnataka State and has been residing in the state for the required duration as per government regulations.',
    'Character Certificate': 'is a person of good character and has no adverse criminal records as per the verification conducted by the concerned authorities.'
  };
  return contents[certificateType] || 'has been verified and certified by the Government of Karnataka.';
};

// Helper function to split long text into multiple lines
const splitTextIntoLines = (text, maxCharsPerLine) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
};

module.exports = { generateCertificatePDF };