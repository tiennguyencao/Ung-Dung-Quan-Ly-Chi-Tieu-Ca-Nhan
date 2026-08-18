# 💰 Ứng dụng Quản lý Chi tiêu Cá nhân (Personal Expense Manager)

> **Bài tập lớn giữa kỳ – Môn Software Engineering**
> Sinh viên thực hiện: Nguyễn Cao Tiến – 22012834

## 1. Giới thiệu

Personal Expense Manager là ứng dụng hỗ trợ người dùng ghi chép, theo dõi và quản lý các khoản thu – chi cá nhân hằng ngày. Ứng dụng giúp người dùng lập ngân sách, phân loại chi tiêu theo danh mục và xem báo cáo thống kê trực quan, từ đó có cái nhìn tổng quan về tình hình tài chính cá nhân và đưa ra quyết định chi tiêu hợp lý hơn.

**Đối tượng sử dụng:** Cá nhân có nhu cầu quản lý tài chính cá nhân (sinh viên, người đi làm, hộ gia đình...).

## 2. Yêu cầu chức năng (Functional Requirements)

### 2.1. Quản lý tài khoản người dùng
- [ ] Đăng ký tài khoản mới bằng email/mật khẩu
- [ ] Đăng nhập / Đăng xuất
- [ ] Quên mật khẩu / Đặt lại mật khẩu
- [ ] Xem và cập nhật thông tin cá nhân

### 2.2. Quản lý giao dịch thu – chi
- [ ] Thêm mới một khoản thu hoặc chi (số tiền, ngày, danh mục, ghi chú)
- [ ] Sửa hoặc xóa giao dịch đã tạo
- [ ] Xem danh sách giao dịch, hỗ trợ lọc theo thời gian, danh mục, loại thu/chi
- [ ] Tìm kiếm giao dịch theo từ khóa/ghi chú

### 2.3. Quản lý danh mục (Category)
- [ ] Cung cấp sẵn danh mục mặc định (ăn uống, di chuyển, hóa đơn, giải trí, lương, thưởng...)
- [ ] Cho phép người dùng tạo, sửa, xóa danh mục tùy chỉnh

### 2.4. Quản lý ngân sách (Budget)
- [ ] Thiết lập hạn mức ngân sách theo tháng và/hoặc theo từng danh mục
- [ ] Cảnh báo khi chi tiêu vượt hoặc gần đạt ngân sách đã đặt

### 2.5. Thống kê – Báo cáo
- [ ] Biểu đồ tổng quan thu – chi theo ngày/tuần/tháng/năm
- [ ] Biểu đồ tỷ lệ chi tiêu theo danh mục (dạng pie/donut chart)
- [ ] So sánh thu nhập và chi tiêu giữa các khoảng thời gian

### 2.6. Giao dịch định kỳ (Recurring Transactions)
- [ ] Thiết lập các khoản thu/chi lặp lại tự động theo chu kỳ (VD: tiền thuê nhà, lương hằng tháng)

### 2.7. Xuất & sao lưu dữ liệu
- [ ] Xuất báo cáo/danh sách giao dịch ra file Excel hoặc PDF
- [ ] Sao lưu và khôi phục dữ liệu người dùng

### 2.8. Thông báo / Nhắc nhở
- [ ] Nhắc nhở nhập chi tiêu hằng ngày (tùy chọn)
- [ ] Cảnh báo khi vượt ngân sách

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

| # | Loại yêu cầu | Mô tả chi tiết |
|---|---|---|
| 1 | Hiệu năng (Performance) | Thời gian phản hồi cho các thao tác cơ bản (thêm/sửa/xóa/xem giao dịch) không quá 2 giây trong điều kiện mạng bình thường |
| 2 | Bảo mật (Security) | Mật khẩu được mã hóa (hashing) trước khi lưu; xác thực bằng token (JWT); mỗi người dùng chỉ truy cập được dữ liệu của chính mình |
| 3 | Khả năng sử dụng (Usability) | Giao diện trực quan, dễ thao tác cho người dùng không chuyên về công nghệ; hỗ trợ responsive trên desktop và mobile |
| 4 | Độ tin cậy (Reliability) | Hệ thống hoạt động ổn định, xử lý lỗi (error handling) hợp lý, hạn chế tối đa mất dữ liệu |
| 5 | Khả năng mở rộng (Scalability) | Kiến trúc cho phép dễ dàng bổ sung tính năng mới (đa tiền tệ, chia sẻ ví gia đình...) trong tương lai |
| 6 | Khả năng bảo trì (Maintainability) | Mã nguồn tổ chức rõ ràng theo từng module, có comment, tuân thủ coding convention |
| 7 | Khả năng tương thích (Compatibility) | Hoạt động tốt trên các trình duyệt phổ biến (Chrome, Firefox, Edge, Safari) |
| 8 | Sao lưu & phục hồi (Backup & Recovery) | Dữ liệu được sao lưu định kỳ; có khả năng khôi phục khi xảy ra sự cố |

## 4. Công nghệ dự kiến sử dụng (Proposed Technology Stack)

| Thành phần | Công nghệ dự kiến |
|---|---|
| Frontend | ReactJS (hoặc Vue.js), HTML/CSS, Tailwind CSS/Bootstrap |
| Backend | Node.js + Express.js |
| Cơ sở dữ liệu | MongoDB (hoặc MySQL/PostgreSQL nếu theo mô hình quan hệ) |
| Xác thực (Authentication) | JWT (JSON Web Token) |
| Trực quan hóa dữ liệu | Chart.js / Recharts |
| Quản lý phiên bản | Git & GitHub |
| Công cụ hỗ trợ | VS Code, Postman, Figma (thiết kế UI) |
| Triển khai (Deployment) | Vercel/Netlify (Frontend), Render/Railway (Backend) |

> *Ghi chú: Đây là đề xuất công nghệ ban đầu, có thể điều chỉnh sau 

## 5. Phạm vi dự án (Scope)

Phiên bản đầu tiên sẽ tập trung vào các chức năng cốt lõi: quản lý tài khoản, quản lý giao dịch, quản lý danh mục và thống kê cơ bản. Các chức năng nâng cao (giao dịch định kỳ, xuất báo cáo, thông báo...) có thể sẽ được phát triển ở giai đoạn tiếp theo.
