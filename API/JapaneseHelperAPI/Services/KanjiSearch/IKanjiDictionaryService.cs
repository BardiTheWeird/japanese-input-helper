using System.Collections.Generic;
using JapaneseHelperAPI.Model;

namespace JapaneseHelperAPI.Services.KanjiSearch
{
    public interface IKanjiDictionaryService
    {
        public IEnumerable<KanjiEntry> SearchKanjiByMeaning(string meaning, bool sortEntries = false,
            uint? topEntries = null,
            bool sortMeanings = false, uint? topMeanings = null, bool stripReadings = false);

        public KanjiEntry GetKanjiById(int id);
    }
}