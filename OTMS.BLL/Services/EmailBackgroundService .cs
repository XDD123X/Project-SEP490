using Microsoft.Extensions.Hosting;
using OTMS.DAL.Interface;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.Services
{
    public class EmailBackgroundService : BackgroundService
    {
        private readonly IEmailService _emailService;
        private static ConcurrentQueue<(string email, string subject, string message)> emailQueue = new();


        public EmailBackgroundService(IEmailService emailService)
        {
            _emailService = emailService;
        }

        public static void EnqueueEmail(string email, string subject, string message)
        {
            emailQueue.Enqueue((email, subject, message));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if (emailQueue.TryDequeue(out var emailData))
                {
                    try
                    {
                        await _emailService.SendEmailAsync(emailData.email, emailData.subject, emailData.message);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Send Email Failed: {ex.Message}");
                    }
                }
                await Task.Delay(1000);
            }
        }
    }
}
