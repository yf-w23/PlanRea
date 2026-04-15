import { NextRequest, NextResponse } from "next/server";

// 模拟用户数据库
const users: any[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    image: null,
  },
];

/**
 * 用户注册 API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (name.length < 2) {
      return NextResponse.json(
        { message: "用户名至少需要 2 个字符" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { message: "密码至少需要 6 个字符" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 创建新用户
    // 注意：实际项目中应使用 bcrypt 等库对密码进行哈希处理
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password, // 实际项目中应存储哈希值
      image: null,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // 返回成功响应（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      {
        message: "注册成功",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { message: "注册时发生错误，请重试" },
      { status: 500 }
    );
  }
}
