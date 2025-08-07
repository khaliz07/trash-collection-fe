import { NextRequest, NextResponse } from 'next/server'

// Mock payment storage
const pendingPayments = new Map<string, {
  id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  packageId?: string;
  userId?: string;
  method?: string;
}>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const amount = searchParams.get('amount')
    const method = searchParams.get('method')

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Tạo payment record nếu chưa có (khi user quét QR lần đầu)
    if (!pendingPayments.has(paymentId)) {
      pendingPayments.set(paymentId, {
        id: paymentId,
        amount: amount ? parseInt(amount) : 0,
        status: 'pending',
        createdAt: new Date(),
        method: method || 'unknown'
      })
    }

    const payment = pendingPayments.get(paymentId)!
    
    // Tạo trang web thanh toán
    const methodDisplay = getMethodDisplay(payment.method || 'unknown')
    
    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận thanh toán - Thu gom rác</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
              }
              .container { 
                  background: white; 
                  border-radius: 16px; 
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  max-width: 400px; 
                  width: 100%;
                  overflow: hidden;
              }
              .header {
                  background: ${methodDisplay.color};
                  color: white;
                  padding: 20px;
                  text-align: center;
              }
              .header h1 { font-size: 20px; margin-bottom: 5px; }
              .header p { font-size: 14px; opacity: 0.9; }
              .content { padding: 24px; }
              .amount { 
                  font-size: 32px; 
                  font-weight: bold; 
                  color: #2563eb; 
                  text-align: center;
                  margin: 20px 0; 
              }
              .info { margin-bottom: 24px; }
              .info-row { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 8px 0;
                  border-bottom: 1px solid #f3f4f6;
              }
              .info-row:last-child { border-bottom: none; }
              .label { color: #6b7280; font-size: 14px; }
              .value { font-weight: 500; font-size: 14px; }
              .button { 
                  width: 100%;
                  padding: 14px;
                  border: none; 
                  border-radius: 8px; 
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer; 
                  margin: 8px 0;
                  transition: all 0.2s;
              }
              .btn-primary { 
                  background: #10b981; 
                  color: white; 
              }
              .btn-primary:hover { background: #059669; }
              .btn-secondary { 
                  background: #f3f4f6; 
                  color: #374151; 
              }
              .btn-secondary:hover { background: #e5e7eb; }
              .status { 
                  padding: 12px; 
                  border-radius: 8px; 
                  margin: 16px 0; 
                  text-align: center;
                  font-weight: 500;
              }
              .success { background: #d1fae5; color: #065f46; }
              .error { background: #fee2e2; color: #991b1b; }
              .loading { background: #dbeafe; color: #1e40af; }
              .footer {
                  text-align: center;
                  padding: 16px;
                  background: #f9fafb;
                  color: #6b7280;
                  font-size: 12px;
              }
              @media (max-width: 480px) {
                  .container { margin: 0; border-radius: 0; }
                  .amount { font-size: 28px; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${methodDisplay.name}</h1>
                  <p>Xác nhận thanh toán dịch vụ thu gom rác</p>
              </div>
              
              <div class="content">
                  <div class="amount">${payment.amount.toLocaleString('vi-VN')}đ</div>
                  
                  <div class="info">
                      <div class="info-row">
                          <span class="label">Dịch vụ:</span>
                          <span class="value">Gia hạn gói thu gom rác</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Phương thức:</span>
                          <span class="value">${methodDisplay.name}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Mã giao dịch:</span>
                          <span class="value">${payment.id}</span>
                      </div>
                      <div class="info-row">
                          <span class="label">Thời gian:</span>
                          <span class="value">${new Date().toLocaleString('vi-VN')}</span>
                      </div>
                  </div>
                  
                  <div id="status"></div>
                  
                  <button class="button btn-primary" onclick="confirmPayment()" id="confirmBtn">
                      ✅ Xác nhận thanh toán
                  </button>
                  <button class="button btn-secondary" onclick="cancelPayment()" id="cancelBtn">
                      ❌ Hủy thanh toán
                  </button>
              </div>
              
              <div class="footer">
                  Hệ thống thu gom rác thông minh<br>
                  Cảm ơn bạn đã sử dụng dịch vụ
              </div>
          </div>

          <script>
              let isProcessing = false;
              
              async function confirmPayment() {
                  if (isProcessing) return;
                  isProcessing = true;
                  
                  const statusDiv = document.getElementById('status');
                  const confirmBtn = document.getElementById('confirmBtn');
                  const cancelBtn = document.getElementById('cancelBtn');
                  
                  statusDiv.innerHTML = '<div class="status loading">🔄 Đang xử lý thanh toán...</div>';
                  confirmBtn.disabled = true;
                  cancelBtn.disabled = true;
                  
                  try {
                      const response = await fetch('/api/payments/verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                              paymentId: '${payment.id}', 
                              status: 'completed' 
                          })
                      });
                      
                      const result = await response.json();
                      
                      if (response.ok && result.success) {
                          statusDiv.innerHTML = '<div class="status success">✅ Thanh toán thành công!</div>';
                          setTimeout(() => {
                              statusDiv.innerHTML += '<div class="status success">Trang sẽ tự động đóng sau 3 giây...</div>';
                              setTimeout(() => window.close(), 3000);
                          }, 1000);
                      } else {
                          throw new Error(result.message || 'Lỗi xử lý thanh toán');
                      }
                  } catch (error) {
                      statusDiv.innerHTML = '<div class="status error">❌ ' + error.message + '</div>';
                      confirmBtn.disabled = false;
                      cancelBtn.disabled = false;
                      isProcessing = false;
                  }
              }
              
              async function cancelPayment() {
                  if (isProcessing) return;
                  isProcessing = true;
                  
                  const statusDiv = document.getElementById('status');
                  
                  try {
                      const response = await fetch('/api/payments/verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                              paymentId: '${payment.id}', 
                              status: 'failed' 
                          })
                      });
                      
                      statusDiv.innerHTML = '<div class="status error">❌ Đã hủy thanh toán</div>';
                      setTimeout(() => window.close(), 2000);
                  } catch (error) {
                      console.error('Error:', error);
                      statusDiv.innerHTML = '<div class="status error">❌ Lỗi hủy thanh toán</div>';
                  }
              }
              
              // Auto-refresh payment status
              setInterval(async () => {
                  if (isProcessing) return;
                  try {
                      const response = await fetch('/api/payments/check/${payment.id}');
                      const result = await response.json();
                      if (result.success && result.payment.status === 'success') {
                          document.getElementById('status').innerHTML = '<div class="status success">✅ Thanh toán đã được xác nhận từ hệ thống khác!</div>';
                          setTimeout(() => window.close(), 3000);
                      }
                  } catch (error) {
                      console.error('Error checking payment:', error);
                  }
              }, 3000);
          </script>
      </body>
      </html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })

  } catch (error) {
    console.error('Verify payment GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status } = body

    if (!paymentId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const payment = pendingPayments.get(paymentId)
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    if (status === 'completed') {
      payment.status = 'success'
    } else if (status === 'failed') {
      payment.status = 'failed'
    }

    pendingPayments.set(paymentId, payment)

    return NextResponse.json({ 
      success: true, 
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMethodDisplay(method: string) {
  switch (method) {
    case 'momo':
      return { name: 'Ví MoMo', color: '#d91982' };
    case 'zalopay':
      return { name: 'ZaloPay', color: '#0068ff' };
    case 'bank':
      return { name: 'Chuyển khoản ngân hàng', color: '#16a085' };
    case 'credit':
      return { name: 'Thẻ tín dụng', color: '#9b59b6' };
    default:
      return { name: 'Thanh toán điện tử', color: '#34495e' };
  }
}
