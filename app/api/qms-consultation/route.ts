import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      companyName,
      contactName,
      email,
      phone,
      companySize,
      qmsStatus,
      certGoals,
      preferredTime,
      message,
    } = data

    const certGoalsText = Array.isArray(certGoals) && certGoals.length > 0
      ? certGoals.join(', ')
      : '미선택'

    // 운영자 알림 메일
    await resend.emails.send({
      from: 'QMS 위자드 <noreply@qmintel.com>',
      to: 'support@qmintel.com',
      subject: `[QMS 구축 상담] ${companyName} — ${contactName}`,
      html: `
        <h2 style="color:#2B4B8C">QMS 구축 상담 신청</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9;width:140px"><b>회사명</b></td><td style="padding:8px;border:1px solid #eee">${companyName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>담당자</b></td><td style="padding:8px;border:1px solid #eee">${contactName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>이메일</b></td><td style="padding:8px;border:1px solid #eee">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>전화번호</b></td><td style="padding:8px;border:1px solid #eee">${phone}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>회사 규모</b></td><td style="padding:8px;border:1px solid #eee">${companySize}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>현재 QMS 상태</b></td><td style="padding:8px;border:1px solid #eee">${qmsStatus}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>인증 목표</b></td><td style="padding:8px;border:1px solid #eee">${certGoalsText}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>희망 상담 시간대</b></td><td style="padding:8px;border:1px solid #eee">${preferredTime || '미입력'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;background:#f9f9f9"><b>추가 문의</b></td><td style="padding:8px;border:1px solid #eee">${message || '없음'}</td></tr>
        </table>
      `,
    })

    // 신청자 확인 메일
    await resend.emails.send({
      from: 'QMS 위자드 <noreply@qmintel.com>',
      to: email,
      subject: `[QMS 위자드] 상담 신청이 접수되었습니다 — ${companyName}`,
      html: `
        <h2 style="color:#2B4B8C">상담 신청이 접수되었습니다</h2>
        <p style="font-size:15px;color:#444">${contactName}님, 안녕하세요.<br>
        <b>${companyName}</b>의 QMS 구축 상담 신청이 정상적으로 접수되었습니다.</p>
        <p style="font-size:14px;color:#666">영업일 기준 <b>1~2일 내</b>에 담당자가 연락드립니다.<br>
        급한 문의사항은 <a href="mailto:support@qmintel.com">support@qmintel.com</a>으로 연락 주세요.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="font-size:12px;color:#999">본 메일은 자동 발송됩니다.</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[qms-consultation]', err)
    return NextResponse.json({ ok: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
