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

    // Get payment info from database to display for review
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentId,
      },
      include: {
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thanh toán không tồn tại</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-2xl shadow-xl p-8">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-gray-800 mb-2">Thanh toán không tồn tại</h1>
              <p class="text-gray-600 mb-6">Liên kết thanh toán đã hết hạn hoặc không hợp lệ</p>
              <button onclick="window.close()" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">
                Đóng
              </button>
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

    // Check if already completed
    if (payment.status === "success") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thanh toán đã hoàn tất</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen bg-green-50 flex items-center justify-center p-4">
          <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-2xl shadow-xl p-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-green-700 mb-2">Đã thanh toán thành công</h1>
              <p class="text-gray-600 mb-6">Giao dịch này đã được hoàn tất trước đó</p>
              <button onclick="window.close()" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                Đóng
              </button>
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

    // Return review/confirmation page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận thanh toán</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .loading { animation: pulse 1.5s ease-in-out infinite; }
          
          @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
          }
          .checkmark-animation {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: checkmark 1s ease-in-out forwards;
          }
          .confetti {
            animation: confetti 3s ease-out infinite;
          }
        </style>
      </head>
      <body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div class="max-w-md mx-auto text-center">
          <!-- Review Page -->
          <div id="reviewPage" class="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            <div class="mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-800 mb-2">Xác nhận thanh toán</h1>
              <p class="text-gray-600">Vui lòng kiểm tra thông tin và xác nhận thanh toán</p>
            </div>

            <!-- Payment Details -->
            <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 class="font-semibold text-gray-800 mb-4">Chi tiết thanh toán</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Gói dịch vụ:</span>
                  <span class="font-medium">${
                    payment.packageName || "Gia hạn dịch vụ"
                  }</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Thời hạn:</span>
                  <span class="font-medium">${
                    payment.duration || "1 tháng"
                  }</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Số tiền:</span>
                  <span class="font-semibold text-lg text-green-600">
                    ${
                      payment.amount
                        ? payment.amount.toLocaleString("vi-VN")
                        : "0"
                    }đ
                  </span>
                </div>
                <hr class="border-gray-300">
                <div class="flex justify-between">
                  <span class="text-gray-600">Mã giao dịch:</span>
                  <span class="font-mono text-sm">${paymentId}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button 
                id="confirmBtn"
                onclick="confirmPayment()"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Xác nhận thanh toán
              </button>
              
              <button 
                onclick="window.close()" 
                class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                ❌ Hủy bỏ
              </button>
            </div>

            <p class="text-xs text-gray-500 mt-4">
              Bằng cách xác nhận, bạn đồng ý với các điều khoản dịch vụ
            </p>
          </div>

          <!-- Success Page (Hidden initially) -->
          <div id="successPage" class="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden" style="display: none;">
            <!-- Confetti Elements -->
            <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div class="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full confetti" style="animation-delay: 0.5s;"></div>
              <div class="absolute top-16 right-12 w-2 h-2 bg-red-400 rounded-full confetti" style="animation-delay: 1s;"></div>
              <div class="absolute top-20 left-20 w-3 h-3 bg-blue-400 rounded-full confetti" style="animation-delay: 1.5s;"></div>
              <div class="absolute top-12 right-20 w-2 h-2 bg-purple-400 rounded-full confetti" style="animation-delay: 2s;"></div>
              <div class="absolute top-24 left-16 w-3 h-3 bg-green-400 rounded-full confetti" style="animation-delay: 2.5s;"></div>
            </div>

            <!-- Success Icon -->
            <div class="relative z-10">
              <div class="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none">
                  <path 
                    class="checkmark-animation" 
                    d="M7 13l3 3 7-7" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <h1 class="text-3xl font-bold text-green-700 mb-3">
                Thanh toán thành công! 🎉
              </h1>

              <p class="text-gray-600 mb-6">
                Gói dịch vụ thu gom rác đã được gia hạn thành công.<br>
                Cảm ơn bạn đã sử dụng dịch vụ!
              </p>

              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="text-sm text-gray-500 mb-1">Mã giao dịch</div>
                <div class="font-mono text-lg font-semibold text-gray-800">${paymentId}</div>
              </div>

              <div class="space-y-3">
                <button 
                  onclick="window.close()" 
                  class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Hoàn tất
                </button>
                <p class="text-xs text-gray-500">
                  Tự động đóng sau 10 giây...
                </p>
              </div>
            </div>
          </div>
        </div>

        <script>
          async function confirmPayment() {
            const confirmBtn = document.getElementById('confirmBtn');
            const reviewPage = document.getElementById('reviewPage');
            const successPage = document.getElementById('successPage');
            
            // Disable button and show loading
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="loading">⏳ Đang xử lý...</span>';
            
            try {
              // Call POST API to confirm payment
              const response = await fetch('/api/payments/confirm/${paymentId}', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              const result = await response.json();
              
              if (result.success) {
                // Hide review page and show success page
                reviewPage.style.display = 'none';
                successPage.style.display = 'block';
                
                // Communicate back to parent window
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'payment_success',
                    paymentId: '${paymentId}'
                  }, '*');
                }
                
                // Auto close after 10 seconds
                setTimeout(() => {
                  window.close();
                }, 10000);
                
              } else {
                alert('Lỗi thanh toán: ' + (result.message || 'Unknown error'));
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '✅ Xác nhận thanh toán';
              }
            } catch (error) {
              console.error('Payment confirmation error:', error);
              alert('Lỗi kết nối. Vui lòng thử lại.');
              confirmBtn.disabled = false;
              confirmBtn.innerHTML = '✅ Xác nhận thanh toán';
            }
          }
        </script>
      </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Update payment status to success
    const updatedPayment = updatePaymentStatus(paymentId, "success", {
      confirmedAt: new Date().toISOString(),
      method: "api_call",
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
