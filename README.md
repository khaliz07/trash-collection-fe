# 📘 BRD – Tài liệu phân tích nghiệp vụ theo vai trò (User / Collector / Admin)

## 1. 🎯 Mục tiêu tài liệu
Tài liệu mô tả chi tiết các yêu cầu nghiệp vụ và logic xử lý theo vai trò trong hệ thống quản lý thu gom rác:
- **User** – Hộ gia đình
- **Collector** – Nhân viên thu gom
- **Admin** – Quản trị hệ thống

---

## 2. 👤 USER – HỘ GIA ĐÌNH

### 2.1. Thông tin lưu trữ
- Họ tên chủ hộ
- SĐT (đăng nhập & OTP)
- Địa chỉ (tỉnh/huyện/xã/số nhà)
- Gói dịch vụ (tháng/quý/năm)
- Lịch sử thanh toán
- Lịch sử thu gom
- Yêu cầu thu gom gấp
- Trạng thái tài khoản

### 2.2. Luồng nghiệp vụ
1. Đăng ký → OTP → Địa chỉ → Chọn gói → Thanh toán → Kích hoạt
2. Tự động tạo lịch thu gom theo khu vực
3. Gửi thông báo trước mỗi lần thu gom
4. User có thể tạo yêu cầu thu gom gấp
5. Theo dõi trạng thái: Đã thu / Chưa thu / Quá hạn

### 2.3. Business rules
- Một địa chỉ chỉ thuộc 1 khu vực
- Phải có gói hoạt động mới được tạo request gấp
- Hạn chế tính năng nếu chưa thanh toán
- Nhắc nhở 3 ngày trước khi hết gói

---

## 3. 🚛 COLLECTOR – NHÂN VIÊN THU GOM

### 3.1. Thông tin lưu trữ
- Họ tên, SĐT
- Khu vực phụ trách
- Lịch làm việc
- Hiệu suất công việc
- Lịch sử check-in (vị trí, thời gian, ảnh)
- Trạng thái hoạt động

### 3.2. Luồng nghiệp vụ
1. Đăng nhập → Xem danh sách cần thu
2. Thu gom → Check-in + ảnh → Cập nhật trạng thái
3. Khi có request gấp → Nhận thông báo → Xác nhận → Thực hiện
4. Kết thúc ca → Xem hiệu suất

### 3.3. Business rules
- Chỉ thu trong khu vực được phân công
- Check-in yêu cầu:
  - GPS gần địa chỉ user
  - Ảnh xác nhận (tuỳ)
  - Không trễ quá 2 giờ
- Nếu không phản hồi request gấp sau 5 phút → đẩy cho người khác
- User đánh giá thấp → cảnh báo cho admin

---

## 4. 🛠️ ADMIN – QUẢN TRỊ HỆ THỐNG

### 4.1. Thông tin quản lý
- User & Collector
- Khu vực & lịch trình thu gom
- Gói dịch vụ & bảng giá
- Hóa đơn & thanh toán
- Request gấp
- Khiếu nại & đánh giá
- Thống kê tổng thể

### 4.2. Luồng nghiệp vụ
1. Gán collector theo khu vực
2. Tạo lịch thu gom → phân bổ collector
3. Theo dõi hiệu suất & phản hồi
4. Xử lý hóa đơn, thanh toán, khiếu nại
5. Thống kê doanh thu & hiệu quả hệ thống

### 4.3. Business rules
- Collector không tự chọn khu vực
- Lịch thu gom cần gán collector mới được publish
- User không thanh toán → không tạo request
- Có thể tạm khóa tài khoản
- Khu vực không trùng địa chỉ

---

## 5. 🌱 Gợi ý mở rộng nghiệp vụ
- Tích điểm / thưởng cho user thanh toán sớm, giới thiệu bạn
- Collector đấu giá để nhận job thu gom gấp
- Phân loại rác để thu phí cao hơn
- Bản đồ realtime định vị collector

---

## 6. 🧪 MVP Ưu tiên
- Đăng nhập
- Xem lịch thu gom
- Thanh toán dịch vụ
- Collector check-in
- Notification realtime

---


