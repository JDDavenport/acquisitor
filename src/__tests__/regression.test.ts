import { describe, it, expect } from 'vitest'

/**
 * Regression Tests for acquisitor-v3
 * Ensures critical dashboard pages, routes, and API endpoints exist
 */

describe('Dashboard Pages - Existence Check', () => {
  // These tests verify all dashboard pages can be imported without errors
  // This catches accidental deletions or breaking changes

  it('should have dashboard home page', async () => {
    const mod = await import('@/app/dashboard/page')
    expect(mod.default).toBeDefined()
  })

  it('should have deals detail page', async () => {
    const mod = await import('@/app/dashboard/deals/[id]/page')
    expect(mod.default).toBeDefined()
  })

  it('should have discover page', async () => {
    const mod = await import('@/app/dashboard/discover/page')
    expect(mod.default).toBeDefined()
  })

  it('should have intelligence page', async () => {
    const mod = await import('@/app/dashboard/intelligence/page')
    expect(mod.default).toBeDefined()
  })

  it('should have leads page', async () => {
    const mod = await import('@/app/dashboard/leads/page')
    expect(mod.default).toBeDefined()
  })

  it('should have pipeline page', async () => {
    const mod = await import('@/app/dashboard/pipeline/page')
    expect(mod.default).toBeDefined()
  })

  it('should have settings page', async () => {
    const mod = await import('@/app/dashboard/settings/page')
    expect(mod.default).toBeDefined()
  })

  it('should have templates page', async () => {
    const mod = await import('@/app/dashboard/templates/page')
    expect(mod.default).toBeDefined()
  })
})

describe('Authentication Pages', () => {
  // These tests verify auth pages exist

  it('should have login page', async () => {
    const mod = await import('@/app/(auth)/login/page')
    expect(mod.default).toBeDefined()
  })

  it('should have signup page', async () => {
    const mod = await import('@/app/(auth)/signup/page')
    expect(mod.default).toBeDefined()
  })
})

describe('Dashboard Layout and Components', () => {
  // Tests that critical layout components can be imported

  it('should have dashboard layout', async () => {
    const mod = await import('@/app/dashboard/layout')
    expect(mod.default).toBeDefined()
  })

  it('should have main app layout', async () => {
    const mod = await import('@/app/layout')
    expect(mod.default).toBeDefined()
  })
})
