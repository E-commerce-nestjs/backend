# Dockerfile là một bản hướng dẫn (recipe) để Docker xây dựng (build) nên một Docker Image cho ứng dụng của bạn. Image này chứa mọi thứ cần thiết (code, thư viện, môi trường Node.js) để ứng dụng có thể chạy được ở bất kỳ đâu (trên máy bạn, trên server, trên cloud) mà không cần cài đặt lại môi trường.



# --- Giai đoạn 1: Builder (Xây dựng ứng dụng) ---
# Sử dụng image Node.js phiên bản 22.20.0 trên nền Alpine Linux (siêu nhẹ) làm nền tảng.
# Đặt tên giai đoạn này là "builder" để lát nữa có thể copy kết quả sang giai đoạn sau.
FROM node:22.20.0-alpine AS builder

# Tạo và chuyển vào thư mục /app bên trong container. Mọi lệnh sau sẽ chạy tại đây.
WORKDIR /app

# Copy file package.json, package-lock.json và thư mục prisma từ máy bạn vào thư mục /app trong container.
COPY package*.json ./
COPY prisma ./prisma

# Cài đặt tất cả các thư viện (dependencies) cần thiết.
RUN npm install

# Copy toàn bộ code nguồn từ máy bạn vào container. (Lưu ý: .dockerignore sẽ loại bỏ những file không cần thiết như node_modules).
COPY . .

# Chạy lệnh tạo Prisma Client để tương tác với database.
RUN npx prisma generate

# Build ứng dụng NestJS từ TypeScript sang JavaScript (thường ra thư mục dist).
RUN npm run build

# --- Giai đoạn 2: Production (Chạy ứng dụng) ---
# Bắt đầu một giai đoạn mới, lại dùng image Node.js Alpine sạch sẽ.
# Mục đích: Chỉ giữ lại những gì cần thiết để chạy app, bỏ qua code nguồn, file thừa lúc build để image nhẹ nhất.
FROM node:22.20.0-alpine AS production

# Lại vào thư mục /app.
WORKDIR /app

# Cài thêm "dumb-init". Đây là một chương trình nhỏ giúp quản lý tiến trình (process) tốt hơn, tránh lỗi zombie process khi chạy trong Docker.
RUN apk add --no-cache dumb-init

# Copy lại file cấu hình package.
COPY package*.json ./

COPY prisma ./prisma/

# Chỉ cài các thư viện cần thiểt để CHẠY app (dependencies), bỏ qua các thư viện chỉ dùng để code/test (devDependencies). Giúp giảm dung lượng image.
RUN npm install --omit=dev

# COPY QUAN TRỌNG: Chỉ lấy thư mục `dist` (code đã build xong) từ giai đoạn "builder" ở trên sang đây.
COPY --from=builder /app/dist ./dist

# Copy Prisma Client đã tạo ở trên sang.
# Copy Prisma Client đã tạo ở trên sang (Do schema.prisma cấu hình output ra generated/prisma)
COPY --from=builder /app/generated ./generated

# Copy file config prisma (nếu cần).
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Tạo một user và group tên là "nodejs" (ID 1001).
# Mục đích bảo mật: Không nên chạy app với quyền root (quyền cao nhất) trong container.
RUN addgroup -g 1001 -S nodejs && \ 
    adduser -S nodejs -u 1001

# Chuyển quyền sở hữu thư mục /app cho user "nodejs" vừa tạo.
RUN chown -R nodejs:nodejs /app

# Chuyển sang dùng user "nodejs" để chạy các lệnh tiếp theo.
USER nodejs

# Thông báo là container này sẽ lắng nghe ở cổng 3000 (chỉ là tài liệu, cần map port khi chạy `docker run`).
EXPOSE 3000

# Kiểm tra sức khỏe container: Cứ 30s sẽ gọi vào API /health. Nếu trả về 200 OK thì container sống, ngược lại coi là chết (unhealthy).
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"
  
# Dùng dumb-init làm tiến trình cha khởi chạy.
ENTRYPOINT ["dumb-init","--"]

# Lệnh cuối cùng: Chạy file main.js đã build để khởi động server NestJS.
CMD ["node", "dist/src/main.js"]

# dumb-init (hoặc tini) để làm gì?
# Vấn đề: Khi chạy Node.js (hay bất kỳ ứng dụng nào) trực tiếp làm tiến trình chính (PID 1) trong Docker, nó thường không biết cách xử lý các tín hiệu dừng (như SIGTERM, SIGINT) đúng chuẩn Linux. Ví dụ: khi bạn docker stop, Node.js có thể không nhận được lệnh dừng ngay lập tức, dẫn đến việc container bị ép dừng đột ngột (kill) sau 10s, có thể làm lỗi database hoặc mất dữ liệu đang xử lý dở. Ngoài ra, nó còn sinh ra các "tiến trình ma" (zombie processes) ăn mòn tài nguyên hệ thống.
# Giải pháp: dumb-init sinh ra để làm "người bảo mẫu" (init process - PID 1).
# Nó đứng ra nhận mọi tín hiệu từ Docker/Kubernetes.
# Nó chuyển tiếp (forward) các tín hiệu đó cho ứng dụng Node.js con của nó một cách chính xác.
# Nó tự động dọn dẹp các tiến trình con bị chết (reap zombies).
# Kết quả: Container của bạn sẽ dừng (graceful shutdown) mượt mà, nhanh chóng và ổn định hơn rất nhiều.