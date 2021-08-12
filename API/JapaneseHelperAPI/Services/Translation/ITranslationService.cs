using System.Threading.Tasks;

namespace JapaneseHelperAPI.Services.Translation
{
    public enum TranslationStatus
    {
        Ok,
        Timeout,
        Error
    }

    public interface ITranslationService
    {
        public Task<(TranslationStatus, string)> Translate(string query);
    }
}