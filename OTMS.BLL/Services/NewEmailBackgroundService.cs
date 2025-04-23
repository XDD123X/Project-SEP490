using Microsoft.Extensions.Hosting;
using OTMS.DAL.Interface;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using System;

namespace OTMS.BLL.Services
{
    public class NewEmailBackgroundService : BackgroundService
    {
        private readonly IEmailService _emailService;
        private readonly Channel<(string Email, string Subject, string Body)> _emailQueue;

        public NewEmailBackgroundService(IEmailService emailService)
        {
            _emailService = emailService;
            _emailQueue = Channel.CreateUnbounded<(string, string, string)>();
        }

        public async Task EnqueueEmailAsync(string email, string subject, string body)
        {
            await _emailQueue.Writer.WriteAsync((email, subject, body));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("NewEmailBackgroundService đã khởi động.");

            await foreach (var email in _emailQueue.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await _emailService.SendEmailAsync(email.Email, email.Subject, email.Body);
                    Console.WriteLine($"Đã gửi email thành công đến: {email.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Gửi email thất bại: {ex.Message}");
                }
            }

            Console.WriteLine("NewEmailBackgroundService đã dừng lại.");
        }
    }
}
