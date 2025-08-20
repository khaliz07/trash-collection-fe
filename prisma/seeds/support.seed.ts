import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSupportSystem() {
  console.log("🌱 Seeding support system...");

  // Xóa data cũ
  await prisma.supportFeedback.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.fAQ.deleteMany();

  // Tạo FAQ
  const faqs = await prisma.fAQ.createMany({
    data: [
      {
        question: "Làm sao để thanh toán phí dịch vụ?",
        answer:
          'Bạn có thể thanh toán qua nhiều hình thức: VNPay, chuyển khoản ngân hàng, hoặc thanh toán trực tiếp cho nhân viên thu gom. Truy cập mục "Thanh toán" trong ứng dụng để xem chi tiết các gói dịch vụ và thực hiện thanh toán.',
        category: "PAYMENT",
        isActive: true,
        displayOrder: 1,
      },
      {
        question: "Làm sao để xem lịch thu gom rác?",
        answer:
          'Bạn có thể xem lịch thu gom rác tại mục "Lịch thu gom" trên dashboard. Lịch sẽ hiển thị ngày giờ thu gom theo gói dịch vụ bạn đã đăng ký. Bạn cũng có thể nhận thông báo trước 30 phút.',
        category: "SCHEDULE",
        isActive: true,
        displayOrder: 2,
      },
      {
        question: "Tôi quên mật khẩu, phải làm sao?",
        answer:
          'Tại màn hình đăng nhập, nhấn vào "Quên mật khẩu" và nhập email đã đăng ký. Chúng tôi sẽ gửi link reset mật khẩu vào email của bạn. Kiểm tra cả hộp thư spam nếu không thấy email.',
        category: "ACCOUNT",
        isActive: true,
        displayOrder: 3,
      },
      {
        question: "App bị lỗi không đăng nhập được?",
        answer:
          "Vui lòng thử các cách sau: 1) Cập nhật app lên phiên bản mới nhất, 2) Xóa cache và data của app, 3) Khởi động lại điện thoại, 4) Kiểm tra kết nối internet. Nếu vẫn không được, hãy liên hệ hỗ trợ kỹ thuật.",
        category: "TECHNICAL_ISSUE",
        isActive: true,
        displayOrder: 4,
      },
      {
        question: "Làm sao để thay đổi thông tin cá nhân?",
        answer:
          'Truy cập mục "Hồ sơ" trong ứng dụng để cập nhật thông tin cá nhân như họ tên, số điện thoại, địa chỉ. Một số thông tin như email cần được xác thực lại để bảo mật.',
        category: "ACCOUNT",
        isActive: true,
        displayOrder: 5,
      },
      {
        question: "Chi phí dịch vụ thu gom rác là bao nhiều?",
        answer:
          'Chi phí phụ thuộc vào gói dịch vụ bạn chọn. Có các gói: Cơ bản (2 lần/tuần), Tiêu chuẩn (3 lần/tuần), và Cao cấp (hàng ngày). Xem chi tiết giá tại mục "Gói dịch vụ".',
        category: "PAYMENT",
        isActive: true,
        displayOrder: 6,
      },
      {
        question: "Có thể thay đổi lịch thu gom không?",
        answer:
          "Bạn có thể yêu cầu thay đổi lịch thu gom thông qua ứng dụng hoặc liên hệ hotline. Tuy nhiên, việc thay đổi phải tuân theo lịch trình chung của khu vực và có thể mất 1-2 ngày để có hiệu lực.",
        category: "SCHEDULE",
        isActive: true,
        displayOrder: 7,
      },
      {
        question: "Nếu quên đặt rác ra ngoài thì sao?",
        answer:
          'Nếu bạn quên đặt rác ra, nhân viên sẽ không thể thu gom trong lần đó. Bạn có thể sử dụng tính năng "Thu gom khẩn cấp" với phí phụ trội hoặc đợi đến lịch thu gom tiếp theo.',
        category: "SCHEDULE",
        isActive: true,
        displayOrder: 8,
      },
      {
        question: "Có hỗ trợ thu gom rác thải đặc biệt không?",
        answer:
          "Chúng tôi hỗ trợ thu gom một số loại rác thải đặc biệt như đồ điện tử cũ, pin, dược phẩm hết hạn với dịch vụ đặc biệt. Vui lòng liên hệ trước để được tư vấn và báo giá.",
        category: "OTHER",
        isActive: true,
        displayOrder: 9,
      },
      {
        question: "Làm sao để hủy dịch vụ?",
        answer:
          "Để hủy dịch vụ, bạn cần gửi yêu cầu qua ứng dụng hoặc liên hệ hotline trước ít nhất 7 ngày. Chúng tôi sẽ xử lý và hoàn tiền (nếu có) theo chính sách hoàn tiền.",
        category: "OTHER",
        isActive: true,
        displayOrder: 10,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${faqs.count} FAQs`);

  // Tạo một số support requests mẫu cho demo
  // Lấy user đầu tiên để tạo demo requests
  const firstUser = await prisma.user.findFirst({
    where: { role: "USER" },
  });

  if (firstUser) {
    // Sample base64 images for testing (small colored squares)
    const sampleImages = [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Red pixel
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // Green pixel
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGhkYAAAQgAkJ/8VWwAAAABJRU5ErkJggg==" // Blue pixel
    ];

    const supportRequests = await prisma.supportRequest.createMany({
      data: [
        {
          userId: firstUser.id,
          type: "PAYMENT",
          title: "Không nhận được hóa đơn sau khi thanh toán",
          description:
            "Tôi đã thanh toán gói dịch vụ cơ bản thông qua VNPay từ 3 ngày trước nhưng vẫn chưa nhận được hóa đơn điện tử. Mã giao dịch là VNP123456789. Xin hỗ trợ kiểm tra.",
          status: "PENDING",
          priority: "NORMAL",
          images: [sampleImages[0], sampleImages[1]], // 2 ảnh mẫu
        },
        {
          userId: firstUser.id,
          type: "SCHEDULE",
          title: "Lịch thu gom hiển thị sai khu vực",
          description:
            "Lịch thu gom trong ứng dụng hiển thị địa chỉ 123 Đường ABC, Quận 1 nhưng địa chỉ thực tế của tôi là 456 Đường XYZ, Quận 2. Vui lòng cập nhật lại thông tin.",
          status: "RESOLVED",
          priority: "HIGH",
          resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước
          images: [], // Không có ảnh
          adminResponse: "Chúng tôi đã kiểm tra và cập nhật lại địa chỉ của bạn trong hệ thống. Hiện tại lịch thu gom đã hiển thị đúng địa chỉ 456 Đường XYZ, Quận 2. Xin lỗi vì sự bất tiện này!",
          adminResponseAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 1 ngày trước + 2 tiếng
        },
        {
          userId: firstUser.id,
          type: "TECHNICAL_ISSUE",
          title: "App bị crash khi mở lịch sử",
          description:
            'Mỗi lần tôi nhấn vào mục "Lịch sử thu gom" thì ứng dụng bị thoát ra. Tôi đang sử dụng iPhone 12, iOS 16.5. Đã thử xóa và cài lại app nhưng vẫn bị lỗi.',
          status: "IN_PROGRESS",
          priority: "HIGH",
          images: [sampleImages[0]], // 1 ảnh mẫu
        },
        {
          userId: firstUser.id,
          type: "ACCOUNT",
          title: "Muốn thay đổi số điện thoại đăng ký",
          description:
            "Tôi muốn cập nhật số điện thoại từ 0901234567 thành 0987654321 do đã chuyển sim mới. Có cần cung cấp giấy tờ gì không?",
          status: "REJECTED",
          priority: "NORMAL",
          resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 ngày trước
          adminNotes:
            "Khách hàng cần cung cấp CCCD và xác thực qua email trước khi thay đổi số điện thoại.",
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ Created ${supportRequests.count} sample support requests`);

    // Tạo feedback cho request đã resolved
    const resolvedRequest = await prisma.supportRequest.findFirst({
      where: {
        userId: firstUser.id,
        status: "RESOLVED",
        type: "SCHEDULE",
      },
    });

    if (resolvedRequest) {
      await prisma.supportFeedback.create({
        data: {
          supportRequestId: resolvedRequest.id,
          rating: 5,
          comment:
            "Hỗ trợ rất nhanh và nhiệt tình! Vấn đề được giải quyết trong vòng 1 ngày.",
          images: [sampleImages[2]], // Thêm 1 ảnh mẫu vào feedback
        },
      });
      console.log("✅ Created sample feedback");
    }
  }

  console.log("🎉 Support system seeding completed!");
}

export default seedSupportSystem;
