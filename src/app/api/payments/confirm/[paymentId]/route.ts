import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get payment info from database using raw SQL
    const paymentData = (await prisma.$queryRaw`
      SELECT p.*, 
             pkg.name as "packageName", 
             pkg.duration, 
             pkg.price,
             u."name", 
             u.email
      FROM payments p
      JOIN packages pkg ON p."packageId" = pkg.id
      JOIN users u ON p."userId" = u.id
      WHERE p."transactionId" = ${paymentId}::text
      LIMIT 1
    `) as any[];

    if (paymentData.length === 0) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thanh toán không tồn tại</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            .gradient-bg { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
            .card-shadow { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
            .floating-animation { animation: float 6s ease-in-out infinite; }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .slide-up { animation: slideUp 0.8s ease-out; }
            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .shake-animation { animation: shake 0.6s ease-in-out; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
          </style>
        </head>
        <body class="min-h-screen gradient-bg flex items-center justify-center p-4">
          <!-- Background decoration -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl floating-animation"></div>
            <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-300/10 rounded-full blur-3xl floating-animation" style="animation-delay: -3s;"></div>
          </div>
          
          <div class="max-w-lg mx-auto text-center relative z-10">
            <div class="bg-white/95 backdrop-blur-xl rounded-3xl card-shadow p-8 slide-up">
              <div class="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shake-animation">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              
              <h1 class="text-3xl font-bold text-red-700 mb-4">Thanh toán không tồn tại</h1>
              <p class="text-gray-600 mb-8">Liên kết thanh toán đã hết hạn hoặc không hợp lệ</p>
              
              <div class="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100/50 mb-8">
                <div class="flex items-center justify-center text-red-600 mb-3">
                  <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="font-medium">Lỗi liên kết</span>
                </div>
                <ul class="text-sm text-gray-600 text-left space-y-2">
                  <li>• Liên kết có thể đã hết hạn</li>
                  <li>• Thanh toán đã được xử lý</li>
                  <li>• URL không chính xác</li>
                </ul>
              </div>
              
              <button onclick="window.close()" class="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                Đóng cửa sổ
              </button>
            </div>
            
            <!-- Footer -->
            <div class="mt-6">
              <p class="text-white/80 text-sm">❌ Vui lòng kiểm tra lại liên kết thanh toán</p>
            </div>
          </div>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    const payment = paymentData[0];

    // Check if already completed
    if (payment.status === "COMPLETED") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thanh toán đã hoàn tất</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            .gradient-bg { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
            .card-shadow { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
            .floating-animation { animation: float 6s ease-in-out infinite; }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .slide-up { animation: slideUp 0.8s ease-out; }
            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .success-pulse { animation: successPulse 2s ease-in-out infinite; }
            @keyframes successPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          </style>
        </head>
        <body class="min-h-screen gradient-bg flex items-center justify-center p-4">
          <!-- Background decoration -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl floating-animation"></div>
            <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl floating-animation" style="animation-delay: -3s;"></div>
          </div>
          
          <div class="max-w-lg mx-auto text-center relative z-10">
            <div class="bg-white/95 backdrop-blur-xl rounded-3xl card-shadow p-8 slide-up">
              <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 success-pulse">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h1 class="text-3xl font-bold text-green-700 mb-4">Đã thanh toán thành công! 🎉</h1>
              <p class="text-gray-600 mb-8">Giao dịch này đã được hoàn tất trước đó</p>
              
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100/50 mb-8">
                <div class="grid grid-cols-1 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-600 mb-2">Gói dịch vụ</p>
                    <p class="font-semibold text-gray-800 text-lg">${
                      payment.packageName
                    }</p>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-medium text-gray-600 mb-1">Thời hạn</p>
                      <p class="font-medium text-gray-800">${
                        payment.duration
                      } tháng</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-600 mb-1">Số tiền</p>
                      <p class="text-xl font-bold text-green-600">${Number(
                        payment.amount
                      ).toLocaleString("vi-VN")}đ</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button onclick="window.close()" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                Đóng cửa sổ
              </button>
            </div>
            
            <!-- Footer -->
            <div class="mt-6">
              <p class="text-white/80 text-sm">✅ Giao dịch đã được xác nhận và hoàn tất</p>
            </div>
          </div>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Display payment confirmation page for PENDING payments
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận thanh toán</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .card-shadow { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
          .floating-animation { animation: float 6s ease-in-out infinite; }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .pulse-animation { animation: pulse 2s infinite; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .slide-up { animation: slideUp 0.8s ease-out; }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .hover-scale { transition: transform 0.2s ease; }
          .hover-scale:hover { transform: scale(1.02); }
          .gradient-button { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
          }
          .gradient-button:hover { 
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
        </style>
      </head>
      <body class="min-h-screen gradient-bg flex items-center justify-center p-4">
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl floating-animation"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl floating-animation" style="animation-delay: -3s;"></div>
        </div>
        
        <div class="max-w-lg mx-auto relative z-10">
          <div class="bg-white/95 backdrop-blur-xl rounded-3xl card-shadow p-8 slide-up hover-scale">
            <!-- Header Icon -->
            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 floating-animation">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            
            <h1 class="text-3xl font-bold text-gray-800 mb-2 text-center">Xác nhận thanh toán</h1>
            <p class="text-gray-600 text-center mb-8">Vui lòng kiểm tra thông tin và xác nhận</p>
            
            <!-- Payment Details -->
            <div class="space-y-4 mb-8">
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100/50">
                <div class="flex items-center mb-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <p class="text-sm font-medium text-gray-600">Gói dịch vụ</p>
                </div>
                <p class="font-semibold text-gray-800 text-lg">${
                  payment.packageName
                }</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100/50">
                  <div class="flex items-center mb-2">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <p class="text-sm font-medium text-gray-600">Thời hạn</p>
                  </div>
                  <p class="font-semibold text-gray-800">${
                    payment.duration
                  } tháng</p>
                </div>
                
                <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100/50">
                  <div class="flex items-center mb-2">
                    <div class="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    <p class="text-sm font-medium text-gray-600">Số tiền</p>
                  </div>
                  <p class="text-xl font-bold text-orange-600">${Number(
                    payment.amount
                  ).toLocaleString("vi-VN")}đ</p>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100/50">
                <div class="flex items-center mb-2">
                  <div class="w-2 h-2 bg-violet-500 rounded-full mr-3"></div>
                  <p class="text-sm font-medium text-gray-600">Khách hàng</p>
                </div>
                <p class="font-semibold text-gray-800">${payment.name}</p>
                <p class="text-sm text-gray-500 mt-1">${payment.email}</p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="space-y-3">
              <button onclick="confirmPayment()" class="w-full gradient-button text-white font-semibold py-4 px-6 rounded-2xl text-lg shadow-lg">
                <span class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Xác nhận thanh toán
                </span>
              </button>
              
              <button onclick="window.close()" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-[1.02]">
                Hủy bỏ
              </button>
            </div>
            
            <!-- Loading State -->
            <div id="loading" class="hidden text-center mt-6">
              <div class="inline-flex items-center px-6 py-3 bg-blue-50 rounded-2xl">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-blue-700 font-medium">Đang xử lý thanh toán...</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="text-center mt-6">
            <p class="text-white/80 text-sm">🔒 Giao dịch được bảo mật và an toàn</p>
          </div>
        </div>
        
        <script>
          let isProcessing = false;
          
          async function confirmPayment() {
            if (isProcessing) return;
            isProcessing = true;
            
            const loading = document.getElementById('loading');
            const button = document.querySelector('button[onclick="confirmPayment()"]');
            
            // Show loading state
            loading.classList.remove('hidden');
            button.disabled = true;
            button.innerHTML = '<span class="flex items-center justify-center"><svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang xử lý...</span>';
            
            try {
              const response = await fetch('/api/payments/confirm', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  paymentId: '${paymentId}',
                  status: 'success',
                  transactionId: 'manual_confirm_' + Date.now(),
                  userId: '${payment.userId}',
                  packageId: '${payment.packageId}',
                  amount: ${payment.amount},
                  paymentMethod: 'MANUAL'
                })
              });
              
              if (response.ok) {
                const result = await response.json();
                
                // Send message to parent window for QR dialog
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'payment_success',
                    paymentId: '${paymentId}',
                    subscription: result.payment?.subscription
                  }, '*');
                }
                
                // Show success animation before redirect
                document.body.innerHTML = \`
                  <div class="min-h-screen gradient-bg flex items-center justify-center p-4">
                    <div class="max-w-lg mx-auto text-center">
                      <div class="bg-white/95 backdrop-blur-xl rounded-3xl card-shadow p-8 slide-up">
                        <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 floating-animation">
                          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <h1 class="text-3xl font-bold text-green-700 mb-4">Thanh toán thành công! 🎉</h1>
                        <p class="text-gray-600 mb-6">Gói dịch vụ đã được gia hạn thành công</p>
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100/50 mb-6">
                          <p class="text-lg font-semibold text-green-800">${Number(
                            payment.amount
                          ).toLocaleString("vi-VN")}đ</p>
                          <p class="text-sm text-gray-600">${
                            payment.packageName
                          } - ${payment.duration} tháng</p>
                        </div>
                        <p class="text-sm text-gray-500">Tự động đóng sau 3 giây...</p>
                      </div>
                    </div>
                  </div>
                \`;
                
                // Auto close after 3 seconds
                setTimeout(() => {
                  window.close();
                }, 3000);
              } else {
                const error = await response.json();
                showError('Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
              }
            } catch (error) {
              showError('Có lỗi xảy ra: ' + error.message);
            } finally {
              isProcessing = false;
            }
          }
          
          function showError(message) {
            const loading = document.getElementById('loading');
            const button = document.querySelector('button[onclick="confirmPayment()"]');
            
            loading.classList.add('hidden');
            button.disabled = false;
            button.innerHTML = '<span class="flex items-center justify-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Xác nhận thanh toán</span>';
            
            // Show error notification
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg z-50 slide-up';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
              errorDiv.remove();
            }, 5000);
          }
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Error processing payment page:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
