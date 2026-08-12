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

  it('detects RTI filing date near "filed" keyword', () => {
    const result = parseNoticeOrder(
      'RTI Request\nFiled on 18/02/2026\nThis application is submitted under RTI Act',
      'rti-request.pdf'
    )
    expect(result.document_type).toBe('rti_request')
    expect(result.filed_date).toBe('2026-02-18')
  })

  it('detects RTI filing date near "dated" keyword', () => {
    const result = parseNoticeOrder(
      'Right to Information Application\nDated 05-03-2026\nSubject: information request',
      'rti.pdf'
    )
    expect(result.document_type).toBe('rti_request')
    expect(result.filed_date).toBe('2026-03-05')
  })

  it('does not invent a filing date when no keyword context exists', () => {
    const result = parseNoticeOrder(
      'RTI request\nCase no 123\nInformation wanted about roads',
      'rti.pdf'
    )
    expect(result.document_type).toBe('rti_request')
    expect(result.filed_date).toBeNull()
  })

  it('marks RTI with detected filing date as low confidence for review', () => {
    const result = parseNoticeOrder(
      'RTI Application\nFiled on 10/01/2026',
      'rti.pdf'
    )
    expect(result.filed_date).toBe('2026-01-10')
    expect(result.confidence).toBe('low')
    expect(result.missing_fields).toContain('verify_filing_date')
  })
})
