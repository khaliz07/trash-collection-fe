import { NextRequest, NextResponse } from "next/server";

// Sample districts for major provinces
const districts: { [provinceId: string]: Array<{ id: string; name: string }> } =
  {
    "79": [
      // TP.HCM
      { id: "760", name: "Quận 1" },
      { id: "761", name: "Quận 12" },
      { id: "762", name: "Quận Gò Vấp" },
      { id: "763", name: "Quận Bình Thạnh" },
      { id: "764", name: "Quận Tân Bình" },
      { id: "765", name: "Quận Tân Phú" },
      { id: "766", name: "Quận Phú Nhuận" },
      { id: "767", name: "Quận 2" },
      { id: "768", name: "Quận 3" },
      { id: "769", name: "Quận 10" },
      { id: "770", name: "Quận 11" },
      { id: "771", name: "Quận 4" },
      { id: "772", name: "Quận 5" },
      { id: "773", name: "Quận 6" },
      { id: "774", name: "Quận 8" },
      { id: "775", name: "Quận Bình Tân" },
      { id: "776", name: "Quận 7" },
      { id: "777", name: "Quận 9" },
      { id: "778", name: "Huyện Đức Hòa" },
      { id: "779", name: "Huyện Hóc Môn" },
      { id: "780", name: "Huyện Bình Chánh" },
      { id: "781", name: "Huyện Nhà Bè" },
      { id: "782", name: "Huyện Cần Giờ" },
      { id: "783", name: "Huyện Củ Chi" },
    ],
    "01": [
      // Hà Nội
      { id: "001", name: "Quận Ba Đình" },
      { id: "002", name: "Quận Hoàn Kiếm" },
      { id: "003", name: "Quận Tây Hồ" },
      { id: "004", name: "Quận Long Biên" },
      { id: "005", name: "Quận Cầu Giấy" },
      { id: "006", name: "Quận Đống Đa" },
      { id: "007", name: "Quận Hai Bà Trưng" },
      { id: "008", name: "Quận Hoàng Mai" },
      { id: "009", name: "Quận Thanh Xuân" },
      { id: "016", name: "Huyện Sóc Sơn" },
      { id: "017", name: "Huyện Đông Anh" },
      { id: "018", name: "Huyện Gia Lâm" },
      { id: "019", name: "Quận Nam Từ Liêm" },
      { id: "020", name: "Huyện Thanh Trì" },
      { id: "021", name: "Quận Bắc Từ Liêm" },
    ],
    "48": [
      // Đà Nẵng
      { id: "490", name: "Quận Liên Chiểu" },
      { id: "491", name: "Quận Thanh Khê" },
      { id: "492", name: "Quận Hải Châu" },
      { id: "493", name: "Quận Sơn Trà" },
      { id: "494", name: "Quận Ngũ Hành Sơn" },
      { id: "495", name: "Quận Cẩm Lệ" },
      { id: "497", name: "Huyện Hòa Vang" },
      { id: "498", name: "Huyện Hoàng Sa" },
    ],
    "04": [
      // Cao Bằng
      { id: "040", name: "Thành phố Cao Bằng" },
      { id: "042", name: "Huyện Bảo Lâm" },
      { id: "043", name: "Huyện Bảo Lạc" },
      { id: "045", name: "Huyện Thông Nông" },
      { id: "047", name: "Huyện Hà Quảng" },
      { id: "048", name: "Huyện Trà Lĩnh" },
      { id: "049", name: "Huyện Trùng Khánh" },
      { id: "051", name: "Huyện Nguyên Bình" },
      { id: "052", name: "Huyện Hòa An" },
      { id: "053", name: "Huyện Quảng Uyên" },
      { id: "054", name: "Huyện Phục Hòa" },
    ],
    "08": [
      // Tuyên Quang
      { id: "080", name: "Thành phố Tuyên Quang" },
      { id: "082", name: "Huyện Lâm Bình" },
      { id: "083", name: "Huyện Na Hang" },
      { id: "084", name: "Huyện Chiêm Hóa" },
      { id: "085", name: "Huyện Hàm Yên" },
      { id: "086", name: "Huyện Yên Sơn" },
      { id: "087", name: "Huyện Sơn Dương" },
    ],
  };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("provinceId");

    if (!provinceId) {
      return NextResponse.json(
        { error: "provinceId is required" },
        { status: 400 }
      );
    }

    const provinceDistricts = districts[provinceId] || [];
    return NextResponse.json(provinceDistricts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách quận/huyện" },
      { status: 500 }
    );
  }
}
