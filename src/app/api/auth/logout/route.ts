import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Since we're using JWT tokens stored on the frontend,
    // logout is primarily handled client-side.
    // This endpoint can be used for any server-side cleanup if needed.
    
    return NextResponse.json({ 
      message: 'Đăng xuất thành công',
      success: true 
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Lỗi khi đăng xuất' },
      { status: 500 }
    )
  }
}
