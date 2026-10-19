# 💰 Personal Expense Manager — Sổ Chi Tiêu

> **Bài tập lớn giữa kỳ · Software Engineering**  
> Sinh viên thực hiện: Nguyễn Cao Tiến · 22012834

Ứng dụng quản lý chi tiêu cá nhân là ứng dụng web quản lý thu–chi cá nhân, hỗ trợ ghi nhận giao dịch, tổ chức danh mục, đặt ngân sách và xem thống kê. Ứng dụng dùng React ở frontend, Express ở backend và MongoDB để lưu dữ liệu. Giao diện responsive và cấu hình PWA cho phép trải nghiệm qua trình duyệt.

## 1. Phạm vi phiên bản hiện tại

### Chức năng đã triển khai trong source

| Phân hệ | Phạm vi |
|---|---|
| Tài khoản | Đăng ký, đăng nhập, đăng xuất, xem/cập nhật hồ sơ; quy trình quên và đặt lại mật khẩu |
| Giao dịch | Thêm, sửa, xóa, xem danh sách, tìm kiếm và lọc thu–chi |
| Danh mục | Danh mục mặc định, tạo/sửa/xóa danh mục tùy chỉnh; bảo vệ danh mục mặc định |
| Ngân sách | Thiết lập ngân sách theo tháng/danh mục; hiển thị số đã chi, tỷ lệ sử dụng và trạng thái |
| Thống kê | Tổng quan thu–chi, phân tích chi tiêu theo danh mục và xu hướng theo kỳ |
| Trải nghiệm | Responsive, PWA/app shell, thông báo offline và giao diện song ngữ English/Vietnamese; lựa chọn ngôn ngữ được lưu trên trình duyệt |
| Kỹ thuật | API REST, validation, phân quyền theo chủ sở hữu dữ liệu, xử lý lỗi tập trung, rate limiting, CI |

> Bảng này mô tả các phần có trong source; không có nghĩa mọi trường hợp đều đã được kiểm thử end-to-end. Xem [báo cáo rà soát và checklist demo](docs/final-review-and-demo-checklist.md) để phân biệt giữa kiểm thử đã chạy và kiểm tra cần làm thủ công.

### Ngoài phạm vi MVP hiện tại

- Tự động tạo giao dịch định kỳ theo lịch.
- Xuất báo cáo sang Excel/PDF.
- Sao lưu/khôi phục dữ liệu từ giao diện.
- Nhắc nhập chi tiêu hằng ngày hoặc push notification.
- Đồng bộ giao dịch khi offline.

Không nên trình bày các mục này như tính năng đã hoàn thành. Chiến lược offline hiện tại chủ ý chỉ cache app shell; dữ liệu tài chính và request ghi dữ liệu không được cache hoặc xếp hàng để phát lại.

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 18, Vite 5, React Router, Axios, Tailwind CSS, Recharts; LanguageContext + dictionary nội bộ (không thêm thư viện i18n) |
| Mobile web | PWA qua `vite-plugin-pwa` |
| Backend | Node.js, Express 5, REST API |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Validation / protection | express-validator, Helmet, CORS allow-list, rate limiting, Mongo sanitization |
| Testing | Node.js built-in test runner (`node:test`); focused backend HTTP integration tests |
| Code quality / CI | ESLint; GitHub Actions runs backend tests and frontend tests, lint, and build |

## 2.1. Ngôn ngữ giao diện (English / Tiếng Việt)

- Lần mở đầu mặc định là **English** để giữ tương thích với trải nghiệm tiếng Anh hiện tại. Dùng bộ chọn **EN / VI** ở màn hình đăng nhập hoặc thanh trên cùng sau khi đăng nhập.
- Lựa chọn được lưu bằng `localStorage` (`pem-language`) và được khôi phục khi tải lại trang trong cùng trình duyệt.
- Các chuỗi giao diện, nhãn biểu đồ, ngày/tháng và định dạng hiển thị tiền tệ được bản địa hóa. Tên danh mục mặc định chỉ được dịch ở lớp hiển thị; không đổi dữ liệu đã lưu. Tên danh mục tùy chỉnh, ghi chú giao dịch và nội dung người dùng nhập vẫn giữ nguyên.
- Đây là lựa chọn ngôn ngữ phía client; không thay đổi API payload, schema MongoDB, quy tắc tiền tệ VND hay phân quyền.

## 3. Kiến trúc tổng quan

`React UI → Frontend API services → REST API → Routes / Controllers → Services → Mongoose models → MongoDB`

Backend được tổ chức theo module nghiệp vụ (`auth`, `users`, `transactions`, `categories`, `budgets`, `stats`). Controller xử lý request/response; service giữ logic nghiệp vụ; model định nghĩa schema và index. Middleware dùng chung xử lý xác thực, validation và lỗi.

Sơ đồ chi tiết:
- [Architecture](docs/architecture-baseline-v1.0.md)
- [Use cases](docs/use-case-model-v1.0.md) và [Use Case Diagram](docs/use-case-diagram.mermaid)
- [Database design](docs/database-design-baseline-v1.0.md) và [ER diagram](docs/database-er-diagram.mermaid)
- [Requirements](docs/requirements-baseline-v1.0.md)
- [API contract](docs/api-contract-v1.0.md)
- [Test strategy](docs/test-strategy-v1.0.md)
- [Manual backup/restore runbook](docs/backup-restore-runbook.md)
- [Mobile/PWA strategy](docs/mobile-strategy-v1.0.md)
- [MacBook Air M2 setup and verification](docs/macbook-air-m2-setup.md)

## 4. Yêu cầu môi trường

- Node.js 24 LTS được dùng trong CI; backend yêu cầu Node.js `>=22`.
- npm đi kèm Node.js. Trên MacBook Air M2, ưu tiên bản Node.js native Apple Silicon (`arm64`) thay vì bản Intel chạy qua Rosetta. Xem `docs/macbook-air-m2-setup.md`.
- MongoDB chạy local hoặc một MongoDB Atlas database.
- Git (tùy chọn, nếu lấy source qua repository).

## 5. Cài đặt và chạy local

### Bước 1 — Chuẩn bị biến môi trường

Mở hai terminal tại thư mục gốc dự án `personal-expense-manager/`.

Tạo file `backend/.env` từ `backend/.env.example`, sau đó cập nhật ít nhất:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/expense-manager
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

Đổi `JWT_SECRET` thành một giá trị ngẫu nhiên dài. Không đưa `.env` thật lên GitHub. Có thể tạo secret bằng lệnh:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Tính năng gửi email đặt lại mật khẩu cần SMTP. Trong local development, nếu chưa cấu hình SMTP, link reset được ghi ra terminal backend để phục vụ demo. **Không chạy production theo cách này**: ở môi trường không phải development, token reset không được ghi ra log; hãy cấu hình SMTP đầy đủ để gửi email thật.

Frontend dùng proxy Vite mặc định (`/api` → `http://localhost:5001`), vì vậy không cần file env nếu chạy đúng các cổng mặc định. Chỉ tạo `frontend/.env` từ `frontend/.env.example` khi cần trỏ đến API khác origin.

### Bước 2 — Cài dependencies

Terminal 1:

```bash
cd backend
npm ci
```

Terminal 2:

```bash
cd frontend
npm ci
```

### Bước 3 — Khởi tạo danh mục mặc định

Đảm bảo MongoDB đang chạy và terminal backend đã đứng trong thư mục `backend/`:

```bash
npm run seed
```

Lệnh seed có thể chạy lại để bảo đảm các danh mục mặc định tồn tại, không nhằm tạo dữ liệu giao dịch mẫu.

### Bước 3.1 — Thêm dữ liệu demo 1 năm (tùy chọn)

Nếu muốn demo biểu đồ và báo cáo với dữ liệu trải dài một năm, hãy dùng lệnh riêng sau từ thư mục `backend/`:

```bash
npm run seed:demo
```

Script sẽ hỏi email của tài khoản đã đăng ký trong app, hiển thị kế hoạch rồi chỉ tiếp tục nếu bạn gõ chính xác `ADD`. Dữ liệu được tạo là **dữ liệu giả lập để demo**, không phải lịch sử tài chính thật: có lương/thưởng và chi tiêu theo các danh mục mặc định, cùng ngân sách theo tháng.

Script chỉ bổ sung dữ liệu cho tài khoản đã chọn; không xóa hoặc ghi đè giao dịch/ngân sách đang có. Những giao dịch tạo bởi script có ID ổn định nên chạy lại không tạo bản sao trùng; nếu một tháng đã có giao dịch lương/thưởng hoặc ngân sách thì phần đó được giữ nguyên. Khoảng ngày được tính động từ ngày chạy script lùi lại một năm đến hôm nay.

Không chạy lệnh này trong database có dữ liệu sản xuất. Để xem cách hoạt động và giới hạn của dữ liệu mẫu, đọc `docs/demo-history-seed.md`.

### Bước 4 — Chạy backend và frontend

Terminal backend:

```bash
npm run dev
```

Terminal frontend:

```bash
npm run dev
```

Mở `http://localhost:5173`. Backend mặc định chạy tại `http://localhost:5001`; endpoint kiểm tra trạng thái là `http://localhost:5001/health`.

## 6. Lệnh kiểm tra

Chạy từng nhóm lệnh trong đúng thư mục package.

**Backend** (`cd backend`):

```bash
npm test
```

**Frontend** (`cd frontend`):

```bash
npm test
npm run lint
npm run build
```

Script frontend test chạy ba lượt nhằm kiểm tra hành vi ngày/tháng ở các múi giờ khác nhau. GitHub Actions được cấu hình để chạy backend test và frontend test/lint/build cho push lên `main` và pull request vào `main`.

Ghi chú: test tự động hiện tại là bộ kiểm thử tập trung cho một số lỗi hồi quy quan trọng; nó **chưa thay thế** toàn bộ test case trong test strategy. Trước khi nộp, cần thực hiện checklist demo, đặc biệt với xác thực, phân quyền giữa hai tài khoản, thao tác CRUD, ngân sách và các màn hình responsive.

## 7. Demo bằng trình duyệt

**Demo trong cùng Wi-Fi (không deploy):** lấy địa chỉ LAN IPv4 của laptop. Trong terminal frontend chạy:

```bash
npm run dev -- --host 0.0.0.0
```

Sau đó trên điện thoại mở `http://<LAN-IP-cua-laptop>:5173`. Với cấu hình mặc định, Vite chuyển tiếp `/api` tới backend đang chạy trên chính laptop. Cho phép cổng qua firewall nếu được yêu cầu. Không nhập `localhost` trên điện thoại vì khi đó nó trỏ tới chính điện thoại, không phải laptop. Cách này dùng được để demo web; service worker/PWA install thường cần HTTPS (ngoại trừ `localhost` trên chính thiết bị).

**Demo qua URL đã deploy:** đặt `VITE_API_BASE_URL` trỏ tới API thật nếu frontend và backend khác origin, và đặt `CLIENT_ORIGIN` ở backend thành origin frontend được phép. Kiểm tra luồng đăng nhập và CRUD trên điện thoại trước buổi demo. Với deadline gần, URL HTTPS đã kiểm thử thường ít rủi ro hơn.

## 8. Bảo mật và dữ liệu

- Password lưu dưới dạng hash; không lưu mật khẩu dạng plaintext.
- Endpoint xác thực có rate limit; API có rate limit tổng quát.
- Service kiểm tra quyền sở hữu dữ liệu theo user ID; các trường nhạy cảm bị loại khỏi payload có thể ghi.
- JWT secret, MongoDB URI và SMTP credentials chỉ đặt trong environment variables.
- Dữ liệu tài chính không được cache để dùng offline.

Ứng dụng là project học tập, không phải là dịch vụ tài chính production đã được audit bảo mật hoặc chịu tải.
