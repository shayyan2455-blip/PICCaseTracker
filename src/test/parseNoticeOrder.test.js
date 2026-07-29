import { describe, it, expect } from 'vitest'
import { parseNoticeOrder } from '../extraction/parseNoticeOrder'

describe('parseNoticeOrder', () => {
  it('detects order from text', () => {
    const result = parseNoticeOrder('This is an ORDER of the Commission', 'order.pdf')
    expect(result.document_type).toBe('order')
  })

  it('detects first notice from text', () => {
    const result = parseNoticeOrder('First Notice issued', 'doc.pdf')
    expect(result.document_type).toBe('first_notice')
  })

  it('detects RTI request from text', () => {
    const result = parseNoticeOrder('This is an RTI application', 'document.pdf')
    expect(result.document_type).toBe('rti_request')
  })

  it('detects appeal from text', () => {
    const result = parseNoticeOrder('Appeal against the decision', 'document.pdf')
    expect(result.document_type).toBe('appeal_to_pic')
  })

  it('extracts appeal number', () => {
    const result = parseNoticeOrder('Appeal No. 123-45/6789', 'doc.pdf')
    expect(result.appeal_no).toBe('123-45/6789')
  })

  it('extracts date in dd/mm/yyyy format', () => {
    const result = parseNoticeOrder('Date: 15/03/2024', 'doc.pdf')
    expect(result.notice_date).toBe('2024-03-15')
  })

  it('marks disposed when text contains disposed', () => {
    const result = parseNoticeOrder('appeal stands disposed', 'doc.pdf')
    expect(result.is_disposed).toBe(true)
  })

  it('marks confidence low when fields are missing', () => {
    const result = parseNoticeOrder('', 'random.pdf')
    expect(result.confidence).toBe('low')
    expect(result.missing_fields.length).toBeGreaterThan(0)
  })

  it('extracts applicant vs respondent pattern', () => {
    const result = parseNoticeOrder('John Doe vs Public Body', 'doc.pdf')
    expect(result.applicant).toBe('John Doe')
    expect(result.respondent).toBe('Public Body')
  })
})
