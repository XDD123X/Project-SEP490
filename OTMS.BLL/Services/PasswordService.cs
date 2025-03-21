using System;
using System.Security.Cryptography;
using System.Text;

namespace OTMS.BLL.Services
{
    public class PasswordService : IPasswordService
    {
        private static readonly Random _random = new Random();
        public string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                // format string to byte array
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));

                // format byte array to hex string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }

                return builder.ToString();
            }
        }

        public string RandomPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }
    }
}
