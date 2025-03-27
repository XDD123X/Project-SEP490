using Microsoft.Extensions.Configuration;
using OTMS.DAL.Interface;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace OTMS.BLL.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _host;
        private readonly int _port;
        private readonly string _userName;
        private readonly string _password;
        private readonly string _fromAddress;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration)
        {
            var emailSettings = configuration.GetSection("EmailSettings");
            _host = emailSettings["Host"] ?? "smtp.gmail.com";
            _port = int.TryParse(emailSettings["Port"], out int port) ? port : 587;
            _userName = emailSettings["UserName"] ?? "";
            _password = emailSettings["Password"] ?? "";
            _fromAddress = emailSettings["FromAddress"] ?? _userName;
            _fromName = emailSettings["FromName"] ?? "OTMS System";
        }

        /// <summary>
        /// Gửi email đến một người nhận
        /// </summary>
        /// <param name="to">Địa chỉ email người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="htmlMessage">Nội dung email dạng HTML</param>
        public async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            try
            {
                var mail = new MailMessage()
                {
                    From = new MailAddress(_fromAddress, _fromName),
                    Subject = subject,
                    Body = htmlMessage,
                    IsBodyHtml = true
                };

                mail.To.Add(new MailAddress(to));

                using (var client = new SmtpClient(_host, _port))
                {
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_userName, _password);
                    client.EnableSsl = true;

                    await client.SendMailAsync(mail);
                }
                Console.WriteLine($"Email send successfully to: {to}");
            }
            catch (Exception ex)
            {
                // Log lỗi để không gây crash ứng dụng
                Console.WriteLine($"Email không được gửi: {ex.Message}");
            }
        }

        /// <summary>
        /// Gửi email đến nhiều người nhận
        /// </summary>
        /// <param name="toAddresses">Danh sách địa chỉ email người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="htmlMessage">Nội dung email dạng HTML</param>
        public async Task SendEmailToMultipleRecipientsAsync(string[] toAddresses, string subject, string htmlMessage)
        {
            try
            {
                var mail = new MailMessage()
                {
                    From = new MailAddress(_fromAddress, _fromName),
                    Subject = subject,
                    Body = htmlMessage,
                    IsBodyHtml = true
                };

                foreach (var address in toAddresses)
                {
                    mail.To.Add(new MailAddress(address));
                }

                using (var client = new SmtpClient(_host, _port))
                {
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_userName, _password);
                    client.EnableSsl = true;

                    await client.SendMailAsync(mail);
                }
            }
            catch (Exception ex)
            {
                // Log lỗi để không gây crash ứng dụng
                Console.WriteLine($"Email không được gửi: {ex.Message}");
            }
        }
    }
}
