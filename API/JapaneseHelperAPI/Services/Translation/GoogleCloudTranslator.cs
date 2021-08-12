using System;
using System.Threading.Tasks;
using Google.Cloud.Translation.V2;
using Microsoft.Extensions.Logging;

namespace JapaneseHelperAPI.Services.Translation
{
    public class GoogleCloudTranslator : ITranslationService
    {
        private const int Timeout = 20;
        private readonly ILogger<GoogleCloudTranslator> _logger;
        private readonly TranslationClient _translationClient;

        public GoogleCloudTranslator(TranslationClient translationClient, ILogger<GoogleCloudTranslator> logger)
        {
            _translationClient = translationClient;
            _logger = logger;
        }

        public async Task<(TranslationStatus, string)> Translate(string query)
        {
            try
            {
                var res = await _translationClient.TranslateTextAsync(
                    query, LanguageCodes.English, LanguageCodes.Japanese);

                return (TranslationStatus.Ok, res.TranslatedText);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return (TranslationStatus.Error, string.Empty);
            }
        }
    }
}