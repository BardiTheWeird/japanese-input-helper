using System.Threading.Tasks;
using JapaneseHelperAPI.Services.Translation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace JapaneseHelperAPI.Controllers
{
    [ApiController]
    [Route("translate")]
    public class TranslationController : Controller
    {
        private readonly ILogger<TranslationController> _logger;
        private readonly ITranslationService _translator;

        public TranslationController(ILogger<TranslationController> logger, ITranslationService translator)
        {
            _logger = logger;
            _translator = translator;
        }

        [HttpGet]
        [Route("query={query}")]
        public async Task<ActionResult<string>> GetTranslation(string query)
        {
            _logger.LogInformation($"Started processing query '{query}'");

            var (status, result) = await _translator.Translate(query);

            if (status == TranslationStatus.Ok)
                return result;

            if (status == TranslationStatus.Timeout)
                return StatusCode(504);

            return StatusCode(500);
        }
    }
}