export const WHITEKRAAFT_BODY_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #e5e5e5; font-size: 13px;">
    <p style="color: #999999; font-size: 13px; margin-bottom: 16px;">On 28-Oct-26 12:22 PM, Whitekraaft Recruitment wrote:</p>
    <p style="margin-bottom: 12px;">Dear Candidate,</p>
    <p style="margin-bottom: 12px;">Greetings from <strong>OrqoHire | Whitekraaft Solutions!</strong></p>
    <p style="margin-bottom: 12px;">To help us process your profile further and match you with relevant opportunities, please complete the form below at the earliest:</p>
    <p style="margin-bottom: 12px;">Google form - <a href="https://forms.gle/1L/wJB3d2L5wcDgD6" style="color: #5599dd; text-decoration: underline;" target="_blank">https://forms.gle/1L/wJB3d2L5wcDgD6</a></p>
    <p style="margin-bottom: 12px;">Once submitted, our team will review your profile and connect with roles aligned to your career aspirations.</p>
    <p style="margin-bottom: 12px;">Thank you, and we look forward to hearing from you.</p>
    <p style="margin-bottom: 16px;">Career Page - <a href="https://careers.whitekraaft.com/" style="color: #5599dd; text-decoration: underline;" target="_blank">https://careers.whitekraaft.com/</a></p>
    <p style="color: #888888; margin-bottom: 12px;">--</p>
    <div style="font-size: 13px; line-height: 1.5; margin-bottom: 24px;">
      <p style="margin: 0; font-weight: 500;">Warm Regards,</p>
      <p style="margin: 0; font-weight: bold; color: #ffffff;">Vidhya</p>
      <p style="margin: 0; font-weight: bold; color: #ffffff;">OrqoHire | Whitekraaft Solutions LLP</p>
      <p style="margin: 3px 0 0 0;"><span style="color: #e040fb;">📞</span> +91 78322 95550</p>
      <p style="margin: 2px 0 0 0;"><span style="color: #4ba3e3;">🌐</span> <a href="https://www.orqohire.com" style="color: #5599dd; text-decoration: underline;" target="_blank">www.orqohire.com</a></p>
      <p style="margin: 2px 0 0 0;">Corporate Gifting Solutions: <span style="color: #4ba3e3;">🌐</span> <a href="https://www.studiozmagic.com" style="color: #5599dd; text-decoration: underline;" target="_blank">www.studiozmagic.com</a></p>
      <p style="margin-top: 8px; font-size: 11px; color: #888888; max-width: 580px;">Due to my back-to-back calls, there may be times when I am unable to answer your call. Email is the best way to reach me.</p>
    </div>
    <div style="font-size: 13px; line-height: 1.5; margin-top: 16px;">
      <p style="margin: 0; font-weight: 500;">Warm Regards,</p>
      <p style="margin: 0; font-weight: bold; color: #ffffff;">Talent Partners</p>
      <p style="margin: 0; font-weight: bold; color: #ffffff;">OrqoHire | Whitekraaft Solutions LLP</p>
      <p style="margin: 3px 0 0 0;"><span style="color: #e040fb;">📞</span> +91 78322 95550</p>
      <p style="margin: 2px 0 0 0;"><span style="color: #4ba3e3;">🌐</span> <a href="https://www.orqohire.com" style="color: #5599dd; text-decoration: underline;" target="_blank">www.orqohire.com</a></p>
      <p style="margin: 2px 0 0 0;">Corporate Gifting Solutions: <span style="color: #4ba3e3;">🌐</span> <a href="https://www.studiozmagic.com" style="color: #5599dd; text-decoration: underline;" target="_blank">www.studiozmagic.com</a></p>
      <p style="margin-top: 8px; font-size: 11px; color: #888888; max-width: 580px;">Due to my back-to-back calls, there may be times when I am unable to answer your call. Email is the best way to reach me.</p>
    </div>
  </div>
`;

export const MOCK_BODIES_MAP: Record<string, { bodyHtml?: string; bodyText?: string }> = {
  'msg-whitekraaft': { bodyHtml: WHITEKRAAFT_BODY_HTML },
  'msg-gaurav': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Dear Mulayam, Further to our discussions, we are pleased to invite you to discuss our core engineering roadmap...</p>' },
  'msg-jeelan': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Hi Mulayam, please find the attached JD for your review and let me know your availability for an introductory call.</p>' },
  'msg-candidate-outreach': { bodyHtml: `<p style="color: #e5e5e5; font-size: 13px;">Hi Mullayam06, I hope you're doing well! I'm reaching out to see if you are actively considering senior full-stack opportunities...</p>` },
  'msg-thales': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Hello Mulayam, I wanted to provide you with an update regarding your application for the Senior Software position.</p>' },
  'msg-honeywell': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Hello Mullayam, We have new engineering leadership roles available at Honeywell that match your background.</p>' },
  'msg-oracle': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Hello Mulayam, Here is your weekly curated Oracle career opportunities digest.</p>' },
  'msg-oraczen-1': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Welcome to Oraczen AI. Your developer environment and compute clusters are configured and ready for agent orchestration.</p>' },
  'msg-oraczen-2': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Hi Mulayam, Sprint 14 review is scheduled for tomorrow at 3:00 PM IST. Please review the autonomous agent pipeline changes.</p>' },
  'msg-unosend-1': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">UnoSend Service Alert: SMTP transmission health is 99.98% across all transactional sender pools.</p>' },
  'msg-airsend-1': { bodyHtml: '<p style="color: #e5e5e5; font-size: 13px;">Welcome to AirSend. Your modern, privacy-first web mail client is synchronized with IMAP/SMTP.</p>' },
};
