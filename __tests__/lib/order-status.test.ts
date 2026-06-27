import {
  STATUS_LABEL,
  STATUS_TO_STAGE,
  SUBSTATUS_OPTIONS,
  STATUS_ALERT,
  STAGE_CONFIG,
} from '@/lib/order-status'

const ALL_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'ARRIVED_COUNTRY',
  'CUSTOMS',
  'NATIONAL_DISTRIBUTION',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'PENDING_TRANSFER',
] as const

describe('STATUS_LABEL', () => {
  test.each(ALL_STATUSES)('%s is defined', (status) => {
    expect(STATUS_LABEL[status]).toBeDefined()
  })

  test('PENDING → Pendiente', () => {
    expect(STATUS_LABEL.PENDING).toBe('Pendiente')
  })

  test('PENDING_TRANSFER → Pago por transferencia', () => {
    expect(STATUS_LABEL.PENDING_TRANSFER).toBe('Pago por transferencia')
  })
})

describe('STATUS_TO_STAGE', () => {
  const VALID_STAGES = new Set([-1, 0, 1, 2, 3, 4])

  test.each(ALL_STATUSES)('%s maps to a valid stage', (status) => {
    expect(VALID_STAGES.has(STATUS_TO_STAGE[status])).toBe(true)
  })

  test('DELIVERED → 4', () => {
    expect(STATUS_TO_STAGE.DELIVERED).toBe(4)
  })

  test('CANCELLED → -1', () => {
    expect(STATUS_TO_STAGE.CANCELLED).toBe(-1)
  })

  test('PENDING_TRANSFER → 0', () => {
    expect(STATUS_TO_STAGE.PENDING_TRANSFER).toBe(0)
  })
})

describe('SUBSTATUS_OPTIONS', () => {
  test.each(ALL_STATUSES)('%s is defined', (status) => {
    expect(SUBSTATUS_OPTIONS[status]).toBeDefined()
  })

  test('CANCELLED → empty array', () => {
    expect(SUBSTATUS_OPTIONS.CANCELLED).toEqual([])
  })

  test('SHIPPED has exactly 4 entries', () => {
    expect(SUBSTATUS_OPTIONS.SHIPPED).toHaveLength(4)
  })

  test('SHIPPED contains Llegó al aeropuerto de origen', () => {
    expect(SUBSTATUS_OPTIONS.SHIPPED).toContain('Llegó al aeropuerto de origen')
  })

  test('PENDING_TRANSFER has at least 1 entry', () => {
    expect(SUBSTATUS_OPTIONS.PENDING_TRANSFER.length).toBeGreaterThanOrEqual(1)
  })

  test.each(ALL_STATUSES)('%s entries are all non-empty strings', (status) => {
    for (const entry of SUBSTATUS_OPTIONS[status]) {
      expect(typeof entry).toBe('string')
      expect(entry.length).toBeGreaterThan(0)
    }
  })
})

describe('STATUS_ALERT', () => {
  test.each(ALL_STATUSES)('%s is a non-empty string', (status) => {
    expect(typeof STATUS_ALERT[status]).toBe('string')
    expect(STATUS_ALERT[status].length).toBeGreaterThan(0)
  })
})

describe('STAGE_CONFIG', () => {
  test('has exactly 5 elements', () => {
    expect(STAGE_CONFIG).toHaveLength(5)
  })

  test.each([0, 1, 2, 3, 4])('element %i has label and icon', (i) => {
    expect(typeof STAGE_CONFIG[i].label).toBe('string')
    expect(STAGE_CONFIG[i].icon).toBeTruthy()
  })
})
