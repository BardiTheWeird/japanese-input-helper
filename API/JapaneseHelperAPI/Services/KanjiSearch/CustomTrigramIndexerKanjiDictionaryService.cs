using System;
using System.Collections.Generic;
using System.Linq;
using JapaneseHelperAPI.Model;
using Microsoft.Extensions.Logging;

namespace JapaneseHelperAPI.Services.KanjiSearch
{
    public class CustomTrigramIndexerKanjiDictionaryService : IKanjiDictionaryService
    {
        private readonly ILogger<CustomTrigramIndexerKanjiDictionaryService> _logger;

        public CustomTrigramIndexerKanjiDictionaryService(IEnumerable<KanjiEntry> kanjiEntries,
            ILogger<CustomTrigramIndexerKanjiDictionaryService> logger)
        {
            _logger = logger;
            Indexer = new TrigramIndexer<KanjiEntry>(kanjiEntries,
                entry => entry.Meanings);
        }

        private TrigramIndexer<KanjiEntry> Indexer { get; }

        public IEnumerable<KanjiEntry> SearchKanjiByMeaning(string meaning,
            bool sortEntries = false, uint? topEntries = null,
            bool sortMeanings = false, uint? topMeanings = null, bool stripReadings = false)
        {
            try
            {
                var res = Indexer.SearchEntry(meaning);

                if (sortEntries || topEntries.HasValue)
                {
                    res = res
                        .OrderByDescending(e => e.Meanings
                            .Select(m => ResultSimilarity(meaning, m))
                            .Max());
                    if (topEntries.HasValue)
                        res = res.Take((int)topEntries);
                }

                if (sortMeanings || topMeanings.HasValue)
                {
                    res = res.Select(e => new KanjiEntry
                    {
                        Id = e.Id,
                        Literal = e.Literal,
                        Meanings = e.Meanings.ToArray()
                            .OrderByDescending(s => ResultSimilarity(s, meaning))
                            .ToArray(),
                        On = e.On,
                        Kun = e.Kun,
                        Nanori = e.Nanori
                    });

                    if (topMeanings.HasValue)
                        res = res.Select(e =>
                        {
                            e.Meanings = e.Meanings.Take((int)topMeanings).ToArray();
                            return e;
                        });
                }

                if (stripReadings)
                    res = res.Select(e => new KanjiEntry
                    {
                        Id = e.Id,
                        Literal = e.Literal,
                        Meanings = e.Meanings,
                        On = null,
                        Kun = null,
                        Nanori = null
                    });

                return res;
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return null;
            }
        }

        public KanjiEntry GetKanjiById(int id)
        {
            try
            {
                return Indexer.Entries[id - 1];
            }
            catch (Exception e)
            {
                _logger.LogError($"Couldn't get kanji by id {id}. {e.Message}");
                return null;
            }
        }

        private static float ResultSimilarity(string query, string result)
        {
            query = query.ToLower().Trim();
            result = result.ToLower().Trim();

            var perPhraseSimilarity = TrigramExtensions.JacaardTrigramSimilarity(query, result);

            /* Let's assume that our query is "brother".
             * There are no kanji with a meaning "brother".
             * There are, however, kanji with meanings "elder brother" or "big brother".
             * Without this per word similarity sorted search results would rank "bother" higher up than "big brother".
             */
            if (result.Contains(' '))
            {
                var perWordSimilarity = result.Split(' ')
                    .Select(s => TrigramExtensions.JacaardTrigramSimilarity(query, s))
                    .Max();

                // In order to prefer exact matches
                perWordSimilarity -= 0.05f;

                return Math.Max(perPhraseSimilarity, perWordSimilarity);
            }

            return perPhraseSimilarity;
        }
    }
}