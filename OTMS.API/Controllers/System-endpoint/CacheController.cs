using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace OTMS.API.Controllers.System_endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class CacheController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private const string CacheKeysList = "CacheKeys";

        public CacheController(IMemoryCache cache)
        {
            _cache = cache;
        }

        /// <summary>
        /// Lấy toàn bộ dữ liệu trong MemoryCache
        /// </summary>
        [HttpGet("all")]
        public IActionResult GetAllCacheData()
        {
            // Kiểm tra nếu danh sách keys không tồn tại
            if (!_cache.TryGetValue("CacheKeys", out List<string> keys))
            {
                return Ok(new { message = "Cache is empty", data = new Dictionary<string, object>() });
            }

            var cacheData = new Dictionary<string, object>();

            foreach (var key in keys)
            {
                if (_cache.TryGetValue(key, out var value))
                {
                    cacheData[key] = value;
                }
            }

            return Ok(new { message = "Cache Data", data = cacheData });
        }


        /// <summary>
        /// Lấy danh sách tất cả cache keys
        /// </summary>
        [HttpGet("keys")]
        public IActionResult GetCacheKeys()
        {
            if (!_cache.TryGetValue(CacheKeysList, out List<string> keys))
            {
                return Ok(new { message = "Cache is empty", keys = new List<string>() });
            }

            return Ok(new { message = "Cache Keys", keys });
        }

        /// <summary>
        /// Thêm dữ liệu vào cache
        /// </summary>
        [HttpPost("set")]
        public IActionResult SetCacheData(string key, object value)
        {
            if (string.IsNullOrEmpty(key))
            {
                return BadRequest(new { message = "Key is required" });
            }

            // Lưu danh sách các key
            if (!_cache.TryGetValue(CacheKeysList, out List<string> keys))
            {
                keys = new List<string>();
            }

            if (!keys.Contains(key))
            {
                keys.Add(key);
                _cache.Set(CacheKeysList, keys);
            }

            _cache.Set(key, value, TimeSpan.FromMinutes(30)); // Cache 30 phút
            return Ok(new { message = "Cache updated", key, value });
        }

        /// <summary>
        /// Xóa cache theo key
        /// </summary>
        [HttpDelete("remove")]
        public IActionResult RemoveCacheData(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return BadRequest(new { message = "Key is required" });
            }

            _cache.Remove(key);

            if (_cache.TryGetValue(CacheKeysList, out List<string> keys))
            {
                keys.Remove(key);
                _cache.Set(CacheKeysList, keys);
            }

            return Ok(new { message = $"Cache key '{key}' removed" });
        }

        /// <summary>
        /// Xóa toàn bộ cache
        /// </summary>
        [HttpDelete("clear")]
        public IActionResult ClearAllCache()
        {
            if (_cache.TryGetValue(CacheKeysList, out List<string> keys))
            {
                foreach (var key in keys)
                {
                    _cache.Remove(key);
                }
                _cache.Remove(CacheKeysList);
            }

            return Ok(new { message = "All cache cleared" });
        }
    }
}
