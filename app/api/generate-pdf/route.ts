import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

function usd(n: number) {
  return `$${Math.abs(n).toFixed(2)}`
}

export async function GET(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-05-27.dahlia' as const,
  })

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  // Verify payment
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
  }

  const meta = session.metadata ?? {}
  const results = JSON.parse(meta.resultsJson ?? '{}')

  // Build PDF
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()

  const fontBold   = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontReg    = await doc.embedFont(StandardFonts.Helvetica)

  const green  = rgb(0.067, 0.573, 0.373)
  const dark   = rgb(0.1, 0.1, 0.1)
  const gray   = rgb(0.45, 0.45, 0.45)
  const light  = rgb(0.93, 0.97, 0.93)
  const white  = rgb(1, 1, 1)

  // Header bar
  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: green })
  page.drawText('PAY STUB', {
    x: 40, y: height - 45,
    size: 22, font: fontBold, color: white,
  })
  page.drawText('TakeHomePay.app', {
    x: width - 160, y: height - 45,
    size: 11, font: fontReg, color: white,
  })

  let y = height - 100

  // Employer / Employee block
  page.drawText('EMPLOYER', { x: 40, y, size: 8, font: fontBold, color: gray })
  page.drawText('EMPLOYEE', { x: 300, y, size: 8, font: fontBold, color: gray })
  y -= 16
  page.drawText(meta.employerName || 'Employer Name', { x: 40, y, size: 13, font: fontBold, color: dark })
  page.drawText(meta.employeeName || 'Employee Name', { x: 300, y, size: 13, font: fontBold, color: dark })
  y -= 30

  // Pay period
  page.drawText('PAY PERIOD', { x: 40, y, size: 8, font: fontBold, color: gray })
  page.drawText('PAY FREQUENCY', { x: 200, y, size: 8, font: fontBold, color: gray })
  page.drawText('FILING STATUS', { x: 370, y, size: 8, font: fontBold, color: gray })
  y -= 16
  page.drawText(`${meta.payPeriodStart} – ${meta.payPeriodEnd}`, { x: 40,  y, size: 10, font: fontReg, color: dark })
  page.drawText(meta.payFrequency ?? '', { x: 200, y, size: 10, font: fontReg, color: dark })
  page.drawText(meta.filingStatus ?? '', { x: 370, y, size: 10, font: fontReg, color: dark })
  y -= 30

  // Divider
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) })
  y -= 20

  // Table header
  page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 20, color: light })
  page.drawText('DESCRIPTION',          { x: 48,        y, size: 9, font: fontBold, color: dark })
  page.drawText('CURRENT',              { x: 380,       y, size: 9, font: fontBold, color: dark })
  page.drawText('YEAR TO DATE',         { x: 490,       y, size: 9, font: fontBold, color: dark })
  y -= 24

  function tableRow(label: string, current: string, ytd: string, bold = false) {
    const font = bold ? fontBold : fontReg
    page.drawText(label,   { x: 48,  y, size: 9, font, color: dark })
    page.drawText(current, { x: 380, y, size: 9, font, color: dark })
    page.drawText(ytd,     { x: 490, y, size: 9, font, color: dark })
    y -= 18
  }

  // Earnings
  page.drawText('EARNINGS', { x: 48, y, size: 8, font: fontBold, color: gray }); y -= 14
  tableRow('Gross Pay', usd(results.grossPay ?? 0), usd(results.ytdGross ?? 0))

  y -= 4
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })
  y -= 10

  // Deductions
  page.drawText('DEDUCTIONS', { x: 48, y, size: 8, font: fontBold, color: gray }); y -= 14

  if (results.preTaxDeductionsTotal > 0) {
    tableRow('Pre-Tax Deductions', `(${usd(results.preTaxDeductionsTotal)})`,
      `(${usd((results.preTaxDeductionsTotal ?? 0) * 26)})`)
  }
  tableRow('Federal Income Tax',  `(${usd(results.federalTax ?? 0)})`,    `(${usd(results.ytdFederal ?? 0)})`)
  tableRow(`${results.stateName ?? 'State'} Income Tax`, `(${usd(results.stateTax ?? 0)})`, `(${usd(results.ytdState ?? 0)})`)
  tableRow('Social Security',     `(${usd(results.socialSecurity ?? 0)})`, `(${usd(results.ytdSocialSecurity ?? 0)})`)
  tableRow('Medicare',            `(${usd(results.medicare ?? 0)})`,       `(${usd(results.ytdMedicare ?? 0)})`)

  y -= 4
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) })
  y -= 16

  // Net pay row
  page.drawRectangle({ x: 40, y: y - 6, width: width - 80, height: 26, color: light })
  tableRow('NET PAY', usd(results.netPay ?? 0), usd(results.ytdNet ?? 0), true)

  y -= 20

  // Footer note
  page.drawText('This pay stub is for informational purposes only and was generated by TakeHomePay.app.', {
    x: 40, y: 50, size: 7, font: fontReg, color: gray,
  })
  page.drawText('Consult a tax professional or payroll provider for official payroll documentation.', {
    x: 40, y: 40, size: 7, font: fontReg, color: gray,
  })

  const pdfBytes = await doc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="paystub-${meta.employeeName?.replace(/\s+/g, '-') ?? 'stub'}.pdf"`,
    },
  })
}
