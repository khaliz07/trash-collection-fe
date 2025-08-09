import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Generate PDF content (in production, use a PDF library like jsPDF or Puppeteer)
    const pdfContent = generateInvoicePDF(invoiceId)

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { success: false, message: 'Error generating invoice' },
      { status: 500 }
    )
  }
}

function generateInvoicePDF(invoiceId: string): Buffer {
  // Mock PDF content - in production, use proper PDF generation
  const invoiceData = {
    id: invoiceId,
    date: new Date().toLocaleDateString('vi-VN'),
    customerName: 'Khách hàng',
    address: 'Phường Linh Trung, Quận Thủ Đức, TP. HCM',
    service: 'Dịch vụ thu gom rác',
    amount: '80,000đ',
    method: 'QR Code'
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hóa đơn ${invoiceId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-title { font-size: 20px; margin-top: 10px; }
        .invoice-info { margin-bottom: 30px; }
        .invoice-info table { width: 100%; }
        .invoice-info td { padding: 8px 0; }
        .invoice-details { margin-bottom: 30px; }
        .invoice-details table { width: 100%; border-collapse: collapse; }
        .invoice-details th, .invoice-details td { border: 1px solid #ddd; padding: 12px; }
        .invoice-details th { background-color: #f5f5f5; }
        .total { text-align: right; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🗑️ DỊCH VỤ THU GOM RÁC THÔNG MINH</div>
        <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
      </div>

      <div class="invoice-info">
        <table>
          <tr>
            <td><strong>Số hóa đơn:</strong></td>
            <td>${invoiceData.id}</td>
            <td><strong>Ngày:</strong></td>
            <td>${invoiceData.date}</td>
          </tr>
          <tr>
            <td><strong>Khách hàng:</strong></td>
            <td>${invoiceData.customerName}</td>
            <td><strong>Phương thức:</strong></td>
            <td>${invoiceData.method}</td>
          </tr>
          <tr>
            <td><strong>Địa chỉ:</strong></td>
            <td colspan="3">${invoiceData.address}</td>
          </tr>
        </table>
      </div>

      <div class="invoice-details">
        <table>
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoiceData.service}</td>
              <td>1 tháng</td>
              <td>${invoiceData.amount}</td>
              <td>${invoiceData.amount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="total">
        <p>Tổng cộng: <span style="color: #dc2626;">${invoiceData.amount}</span></p>
        <p style="color: #16a34a;">✅ Đã thanh toán</p>
      </div>

      <div class="footer">
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        <p>Hotline: 1900-1234 | Email: support@trashcollection.vn</p>
        <p>Website: trashcollection.vn</p>
      </div>
    </body>
    </html>
  `

  // Convert HTML to PDF (simplified mock)
  // In production, use libraries like Puppeteer, jsPDF, or PDFKit
  return Buffer.from(htmlContent, 'utf-8')
}
