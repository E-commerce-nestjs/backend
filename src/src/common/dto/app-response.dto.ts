import { ApiProperty } from '@nestjs/swagger';

export class AppResponseDto<T> {
  @ApiProperty({ example: true, description: 'Request status' })
  status: boolean;

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  code: number;

  @ApiProperty({ example: 'Success', description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  @ApiProperty({ description: 'Error details', required: false })
  errors?: any;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Response timestamp' })
  timestamp: string;
}

// Cache to store created DTOs to avoid duplicates
const dtoCache = new Map<string, any>();

// Helper function to create typed response DTO for Swagger with unique class names
export function createAppResponseDto<T>(dataType: new () => T) {
  const typeName = dataType.name;
  const cacheKey = `AppResponseDto_${typeName}`;
  
  // Return cached DTO if it exists
  if (dtoCache.has(cacheKey)) {
    return dtoCache.get(cacheKey);
  }
  
  // Create new DTO class with unique name
  class AppResponseDtoTyped extends AppResponseDto<T> {
    @ApiProperty({ type: dataType, required: false })
    declare data?: T;
  }
  
  // Set unique class name for Swagger
  Object.defineProperty(AppResponseDtoTyped, 'name', {
    value: cacheKey,
    writable: false
  });
  
  // Cache the DTO
  dtoCache.set(cacheKey, AppResponseDtoTyped);
  
  return AppResponseDtoTyped;
}


/**
 * GIẢI THÍCH VỀ CONSTRUCTOR SIGNATURE: `new () => T`
 * 
 * Constructor Signature là kiểu dữ liệu đại diện cho một CLASS CÓ THỂ KHỞI TẠO ĐƯỢC.
 * 
 * Cú pháp: new () => T
 * - `new`: Từ khóa báo hiệu đây là constructor signature (class có thể gọi new)
 * - `()`: Constructor không nhận tham số
 * - `=> T`: Khi gọi new, sẽ trả về instance có type T
 * 
 * VÍ DỤ:
 * ```typescript
 * class UserResponseDto {
 *   constructor() { } // Constructor không tham số
 * }
 * 
 * // ✅ ĐÚNG - UserResponseDto là class, có thể new
 * createAppResponseDto(UserResponseDto);
 * 
 * // ❌ SAI - UserType chỉ là type/interface, không thể new
 * type UserType = { id: string };
 * createAppResponseDto(UserType);
 * ```
 * 
 * TẠI SAO CẦN `new () => T`?
 * 
 * 1. Swagger cần class thực tế (có metadata), không phải type/interface
 * 2. Để lấy tên class: dataType.name (chỉ class mới có property .name)
 * 3. Type safety: Đảm bảo chỉ truyền vào class, không phải string/object/primitive
 * 
 * CÁCH HOẠT ĐỘNG CỦA HÀM createAppResponseDto:
 * 
 * Bước 1: Lấy tên class và tạo cache key
 *   - typeName = dataType.name (VD: "UserResponseDto")
 *   - cacheKey = "AppResponseDto_UserResponseDto"
 * 
 * Bước 2: Kiểm tra cache
 *   - Nếu đã tạo class này trước đó → trả về luôn (tránh duplicate DTO error)
 *   - Nếu chưa → tạo mới
 * 
 * Bước 3: Tạo class mới kế thừa AppResponseDto<T>
 *   - Kế thừa tất cả properties: status, code, message, timestamp, errors
 *   - Override property `data` với type cụ thể (T)
 *   - Dùng `declare` để báo TypeScript đây là override, không phải tạo mới
 * 
 * Bước 4: Đặt tên unique cho class
 *   - Dùng Object.defineProperty để đổi tên class
 *   - Tên mới: "AppResponseDto_UserResponseDto", "AppResponseDto_LoginResponseDto", v.v.
 *   - Tránh lỗi: "Duplicate DTO detected: AppResponseDtoTyped"
 * 
 * Bước 5: Lưu vào cache và trả về
 *   - Lưu class vào Map với key là cacheKey
 *   - Lần sau gọi với cùng dataType → trả về class đã lưu
 * 
 * KẾT QUẢ SWAGGER:
 * ```json
 * {
 *   "status": true,
 *   "code": 200,
 *   "message": "Success",
 *   "data": {
 *     "id": "string",
 *     "email": "string",
 *     "firstName": "string",
 *     "lastName": "string",
 *     "role": "USER",
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   },
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 * ```
 * 
 * CÁCH SỬ DỤNG:
 * ```typescript
 * @ApiResponse({
 *   status: HttpStatus.OK,
 *   type: createAppResponseDto(UserResponseDto)
 * })
 * async getUser(): Promise<AppResponseData<User>> {
 *   return AppResponse.ok(user, "Success");
 * }
 * ```
 */