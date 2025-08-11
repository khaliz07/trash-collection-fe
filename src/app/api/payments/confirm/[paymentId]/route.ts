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
              <div class="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p class="text-sm text-gray-600 mb-1">Gói dịch vụ:</p>
                <p class="font-medium text-gray-800">${payment.packageName}</p>
                <p class="text-sm text-gray-600 mb-1 mt-2">Số tiền:</p>
                <p class="font-medium text-gray-800">${Number(
                  payment.amount
                ).toLocaleString("vi-VN")}đ</p>
              </div>
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
      </head>
      <body class="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div class="max-w-md mx-auto">
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Xác nhận thanh toán</h1>
            
            <div class="space-y-4 mb-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Gói dịch vụ:</p>
                <p class="font-medium text-gray-800">${payment.packageName}</p>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Thời hạn:</p>
                <p class="font-medium text-gray-800">${
                  payment.duration
                } tháng</p>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Số tiền:</p>
                <p class="text-xl font-bold text-blue-600">${Number(
                  payment.amount
                ).toLocaleString("vi-VN")}đ</p>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Khách hàng:</p>
                <p class="font-medium text-gray-800">${payment.name}</p>
                <p class="text-sm text-gray-500">${payment.email}</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <button onclick="confirmPayment()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg">
                Xác nhận thanh toán
              </button>
              <button onclick="window.close()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg">
                Hủy
              </button>
            </div>
            
            <div id="loading" class="hidden text-center mt-4">
              <p class="text-gray-600">Đang xử lý...</p>
            </div>
          </div>
        </div>
        
        <script>
          async function confirmPayment() {
            const loading = document.getElementById('loading');
            loading.classList.remove('hidden');
            
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
                
                // Reload to show success page
                window.location.reload();
              } else {
                const error = await response.json();
                alert('Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
                loading.classList.add('hidden');
              }
            } catch (error) {
              alert('Có lỗi xảy ra: ' + error.message);
              loading.classList.add('hidden');
            }
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
