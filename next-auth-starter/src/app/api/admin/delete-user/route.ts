import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// TEMPORARY ADMIN ENDPOINT - DELETE AFTER USE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authUserId = searchParams.get('auth_user_id')
    
    if (!authUserId) {
      return NextResponse.json({ error: 'auth_user_id parameter required' }, { status: 400 })
    }

    console.log(`[ADMIN] Deleting user with auth_user_id: ${authUserId}`)
    
    const result = await prisma.user.delete({
      where: { auth_user_id: authUserId }
    })
    
    console.log(`[ADMIN] Successfully deleted user:`, result)
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${authUserId} deleted successfully`,
      deletedUser: result
    })
    
  } catch (error) {
    console.error('[ADMIN] Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: (error as any)?.message },
      { status: 500 }
    )
  }
}
