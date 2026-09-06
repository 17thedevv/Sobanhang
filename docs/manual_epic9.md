# Epic 9 — NCL-09: Nhập kho

## Mục tiêu nghiệp vụ
Cho phép chủ shop ghi nhận việc nhập hàng từ nhà cung cấp vào kho, tự động cập nhật số lượng tồn kho và công nợ phải trả, thay thế việc ghi chép nhập hàng thủ công bằng sổ sách.

## Giá trị mang lại
Chủ shop kiểm soát chính xác số lượng và giá vốn từng lô hàng nhập, biết rõ đang nợ nhà cung cấp bao nhiêu, hạn chế sai lệch tồn kho do quên ghi chép hoặc nhập sai.

## Danh sách User Stories

| Mã Story | Tên Story | Mô tả chi tiết |
|---|---|---|
| **US-94** | Xem danh sách phiếu nhập hàng | Màn "Sổ nhập hàng": danh sách phiếu, tab trạng thái (Tất cả/Chờ xác nhận/Chưa thanh toán/Hoàn thành/Huỷ), empty state. |
| **US-95** | Tìm kiếm và lọc phiếu nhập | Tìm theo mã phiếu/tên liên hệ; bộ lọc Thời gian, Trạng thái thanh toán, Loại hàng (Sản phẩm/NVL), Nhà cung cấp. |
| **US-96** | Chọn/tạo nhanh nhà cung cấp | Modal "Chọn nhà cung cấp": tab Nhà cung cấp/Danh bạ; nút "+ Tạo nhà cung cấp"; hoặc icon "+người" ở màn thanh toán để thêm bằng SĐT. |
| **US-97** | Thêm sản phẩm/NVL vào phiếu | Màn "Nhập hàng": 2 tab Sản phẩm/Nguyên vật liệu; tìm kiếm, quét mã vạch; bộ lọc loại hàng và Danh mục. |
| **US-98** | Tạo sản phẩm mới | Icon ⚡ ở màn Nhập hàng mở form tạo sản phẩm đầy đủ (giống form tạo sản phẩm chuẩn, không rút gọn). |
| **US-99** | Bật tồn kho cho sản phẩm | Với sản phẩm chưa bật tồn kho, hiện nút "Bật tồn kho" thay vì ô số lượng; mở modal "Thông tin kho hàng" nhập Số lượng và Giá vốn. |
| **US-100** | Chỉnh số lượng và đơn giá | Nút +/- chỉnh số lượng, đơn giá hiển thị và có thể sửa theo từng dòng; giá vốn nhập chỉ áp dụng riêng cho lô này. |
| **US-101** | Giảm giá và phí phát sinh | "Giảm giá" chọn VNĐ hoặc %; "Phí phát sinh" nhập số tiền; hệ thống tự tính lại "Tổng cộng". |
| **US-102** | Ghi chú và đính kèm | Ô "Ghi chú đơn hàng" dạng text, icon camera để đính kèm ảnh. |
| **US-103** | Lưu phiếu nháp (Chờ xác nhận) | Nút "Lưu phiếu" tạo phiếu mã `NHx` trạng thái "Chờ xác nhận"; tồn kho chưa được cộng; hiện Chi tiết đơn. |
| **US-104** | Nhập hàng và thanh toán ngay | Nút "Nhập hàng" vào thẳng màn Thanh toán, nhập số tiền Khách trả, chọn phương thức → "Hoàn thành", cộng tồn kho ngay. |
| **US-105** | Ghi nợ khi nhập hàng nhanh | Toggle "Ghi nợ" ở màn Thanh toán; cho phép Khách trả < Tổng cộng, hiển thị "Còn nợ"; phiếu "Hoàn thành" kèm nhãn "Đã ghi nợ". |
| **US-106** | Xác nhận phiếu đang chờ | Ở màn "Chi tiết nhập hàng" (Chờ xác nhận): bấm Xác nhận chuyển sang thanh toán → Hoàn tất, cộng tồn kho. |
| **US-107** | Thanh toán tiếp phần nợ | Phiếu trạng thái "Thanh toán một phần", hiển thị số dư Phải trả, lịch sử thanh toán, nút "Thanh toán" để trả tiếp. |
| **US-108** | Huỷ hoặc xoá phiếu nhập | Nút "Huỷ bỏ" khi Chờ xác nhận; icon thùng rác khi Hoàn thành. |
| **US-109** | Xuất, in, gửi phiếu nhập | Action "In hoá đơn", "Gửi" (ảnh), "Tải phiếu" (Excel), "In mã vạch". |

## Kiến trúc Database đề xuất

**StockReceipt (Phiếu nhập kho)**
- `id`: UUID
- `code`: String (VD: NH0001)
- `supplierId`: UUID (Nullable - liên kết bảng Supplier/Customer)
- `totalAmount`: Decimal (Tổng tiền hàng)
- `discount`: Decimal (Giảm giá)
- `shippingFee`: Decimal (Phí phát sinh/Vận chuyển)
- `finalAmount`: Decimal (Tổng cộng phải trả)
- `paidAmount`: Decimal (Đã thanh toán)
- `status`: Enum (DRAFT, PARTIAL_PAID, COMPLETED, CANCELLED)
- `note`: String
- `createdAt`, `updatedAt`

**StockReceiptItem (Chi tiết phiếu nhập)**
- `id`: UUID
- `receiptId`: UUID
- `productId`: UUID
- `quantity`: Int
- `importPrice`: Decimal (Giá vốn lúc nhập)
- `subTotal`: Decimal (quantity * importPrice)

**Supplier (Nhà cung cấp)**
*Lưu ý: Có thể dùng chung bảng Customer với cờ `isSupplier = true` hoặc tạo bảng riêng tuỳ kiến trúc hiện tại.*

## Luồng nghiệp vụ chính
1. **Lưu Nháp:** Tạo phiếu -> Trạng thái DRAFT -> Chưa trừ tiền, chưa cộng tồn kho.
2. **Xác nhận & Nhập hàng:** Trạng thái chuyển COMPLETED / PARTIAL_PAID -> Cộng số lượng vào bảng Product, ghi nhận giao dịch chi tiền, ghi nhận nợ nếu trả thiếu.
3. **Thanh toán nợ nhập hàng:** Liên kết với module Sổ Nợ (NCL-07) - Loại giao dịch: "Tôi phải trả".
