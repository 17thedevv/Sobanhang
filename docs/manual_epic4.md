# 🛒 Hướng Dẫn Sử Dụng & Kiểm Thử - Epic 4

Tài liệu này hướng dẫn chi tiết cách sử dụng và kiểm thử các tính năng thuộc **Epic 4: Nghiệp vụ Bán hàng (POS)**.

Màn hình POS (Point of Sale) được thiết kế theo tư duy **Mobile-first**, chia thành 3 bước (3 màn hình) rõ ràng để nhân viên thao tác nhanh và không bị nhầm lẫn.

---

## 1. Bước 1: Chọn Món (Màn hình chính)

Đây là màn hình đầu tiên khi vào menu **Bán hàng**.

1. **Tìm kiếm & Lọc**: 
   - Sử dụng thanh tìm kiếm để gõ Tên sản phẩm, Mã SKU.
   - Bấm vào các thanh trượt (Chips) danh mục (Ví dụ: Đồ ăn, Nước uống) để lọc nhanh các món thuộc danh mục đó.
2. **Thêm vào giỏ hàng**:
   - Bấm nút **+ Thêm** ở sản phẩm để đưa vào giỏ.
   - Khi sản phẩm đã có trong giỏ, dùng nút **+** hoặc **-** để tăng giảm số lượng.
   - **Đặc biệt**: Có thể click trực tiếp vào ô số lượng ở giữa để **gõ tay** con số bất kỳ (VD: gõ 50) thay vì phải bấm nút nhiều lần.
3. **Cảnh báo tồn kho**: 
   - Nếu nhập số lượng lớn hơn số lượng tồn kho thực tế, hệ thống sẽ cảnh báo "Kho chỉ còn [X] sản phẩm!" và tự động đưa số lượng về mức tối đa.
4. Bấm vào thanh màu xanh lá (Bottom bar) chứa Tổng tiền và Số lượng để chuyển sang bước Xác nhận.

---

## 2. Bước 2: Xác nhận đơn (Giỏ hàng)

Màn hình này dùng để review lại đơn hàng và thêm các thông tin phụ trợ.

1. **Chọn bảng giá**: Góc trên cùng bên phải có menu thả xuống cho phép đổi từ **Giá lẻ** sang **Giá sỉ** (hệ thống sẽ tự tính lại tiền).
2. **Xóa/Sửa món**: Vẫn có thể tăng giảm số lượng hoặc bấm dấu **X** để xóa hẳn một món khỏi giỏ.
3. **Thông tin kèm theo**:
   - **Khách hàng**: Chọn khách quen từ danh sách hoặc để trống (Khách lẻ). 
   - **Giảm giá**: Nhập số tiền giảm giá trực tiếp cho đơn.
   - **Vận chuyển**: Nhập phí ship thu thêm.
4. **Phân nhánh xử lý**:
   - Bấm **GIAO SAU**: Nếu khách dặn giao hàng sau. Đơn sẽ lưu trạng thái `CONFIRMED` và `UNPAID` (Chưa thanh toán).
   - Bấm **THANH TOÁN**: Để chuyển sang bước thu tiền.

---

## 3. Bước 3: Thanh toán

Màn hình cuối cùng dành cho việc chốt tiền.

1. **Tính tiền thừa**: Nhập số tiền khách đưa vào ô "Tiền khách đưa". Nếu lớn hơn Tổng tiền, hệ thống sẽ báo ngay số Tiền thừa trả khách.
2. **Chọn Nguồn tiền**: Menu thả xuống liệt kê các két tiền hiện có (Tiền mặt, Vietcombank...) cùng số dư hiện tại để bạn chọn tiền sẽ chạy vào két nào.
3. **Ghi nợ**: 
   - Tích vào ô **Ghi nợ đơn này** nếu khách mua chịu. 
   - Lưu ý: Để ghi nợ, ở bước Xác nhận đơn bắt buộc phải chọn Khách hàng cụ thể. Nếu không, hệ thống sẽ cảnh báo và không cho hoàn tất.
4. Bấm **HOÀN TẤT** để chốt đơn. 

---

## 4. In & Chia sẻ Hóa Đơn

Sau khi chốt đơn thành công, một bảng Hóa đơn sẽ hiện lên giữa màn hình.

- **Trạng thái thông minh**: Tiêu đề hóa đơn sẽ linh hoạt đổi thành "HÓA ĐƠN BÁN HÀNG", "HÓA ĐƠN TẠM TÍNH", hoặc "HÓA ĐƠN GHI NỢ" tùy theo trạng thái thanh toán.
- Hóa đơn ghi nhận đầy đủ: Giảm giá, Phí ship, Tên khách hàng, Trạng thái đơn, Sản phẩm chi tiết.
- Bấm **In hóa đơn** để in ra bill giấy.
- Bấm **Chia sẻ** để copy thông tin hoặc gửi qua các app tin nhắn.
- Bấm nút **X** ở góc hoặc "TẠO ĐƠN MỚI" để dọn dẹp giỏ hàng, đón vị khách tiếp theo.
