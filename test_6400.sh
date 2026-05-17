#!/bin/bash

# Cấu hình
URL="http://localhost:8080/stats"
CONNECTIONS=6400

echo "======================================================"
echo " BẮT ĐẦU TEST TẢI: $CONNECTIONS KẾT NỐI ĐỒNG THỜI"
echo " Target: $URL"
echo "======================================================"

# 1. Tăng giới hạn số file/socket được mở cùng lúc của Hệ điều hành
# Mặc định OS thường chỉ cho mở 1024, ta cần tăng lên 10000
ulimit -n 10000
if [ $? -ne 0 ]; then
    echo "[CẢNH BÁO] Không thể tự động tăng ulimit. Nếu script lỗi, hãy chạy lệnh này bằng quyền root (sudo)."
fi

echo "[1/3] Đang tạo $CONNECTIONS tiến trình curl ngầm..."

# 2. Vòng lặp bắn 6400 request cùng lúc
# Dấu '&' ở cuối lệnh curl giúp đẩy tiến trình chạy ngầm (background) ngay lập tức
for i in $(seq 1 $CONNECTIONS); do
    curl -s -o /dev/null "$URL" &
    
    # In tiến độ ra màn hình cho mỗi 1000 request để bạn dễ theo dõi
    if [ $((i % 1000)) -eq 0 ]; then
        echo "  -> Đã kích hoạt $i tiến trình..."
    fi
done

echo "[2/3] Đã gửi toàn bộ lệnh! Đang chờ server xử lý và phản hồi..."

# 3. Lệnh wait sẽ chặn script lại cho đến khi toàn bộ 6400 tiến trình ngầm (curl) chạy xong
wait

echo "======================================================"
echo "[3/3] HOÀN TẤT TEST TẢI!"
echo "Hãy kiểm tra ngay màn hình Console của HttpServerCore"
echo "Hoặc mở trình duyệt: http://localhost:8080/stats để xem bộ đếm."
echo "======================================================"