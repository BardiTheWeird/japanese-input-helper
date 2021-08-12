using System;
using System.Collections.Generic;
using System.Linq;

namespace JapaneseHelperAPI.Services.KanjiSearch
{
    public static class TrigramExtensions
    {
        private static IEnumerable<string> GenerateAllSubstrings(string str, int minLength, int maxLength)
        {
            for (var i = minLength; i <= maxLength; i++)
            for (var j = 0; j <= str.Length - i; j++)
                yield return str[j..(j + i)];
        }

        public static IEnumerable<string> ToTrigrams(this string str)
        {
            return GenerateAllSubstrings(str, 1, 3)
                .Distinct();
        }

        public static float JacaardTrigramSimilarity(string s1, string s2)
        {
            var s1Trigrams = s1.ToTrigrams();
            var s2Trigrams = s2.ToTrigrams();

            float intersection = s1Trigrams.Intersect(s2Trigrams).Count();
            float union = s1Trigrams.Union(s2Trigrams).Count();

            return union == 0 ? 1 : intersection / union;
        }
    }

    public class TrigramIndexer<T>
    {
        public TrigramIndexer()
        {
            Entries = new List<T>();
            TrigramIndices = new Dictionary<string, HashSet<int>>();
        }

        public TrigramIndexer(IEnumerable<T> entries, Func<T, string[]> toTrigrammable) : this()

        {
            foreach (var entry in entries) AddEntry(entry, toTrigrammable);
        }

        public List<T> Entries { get; set; }
        public Dictionary<string, HashSet<int>> TrigramIndices { get; set; }

        public void AddEntry(T entry, Func<T, string[]> toTrigrammable)
        {
            var trigrams = toTrigrammable(entry)
                .Select(str => str.ToTrigrams());

            var index = Entries.Count;
            Entries.Add(entry);

            foreach (var perWordTrigram in trigrams)
            foreach (var trigram in perWordTrigram)
                if (TrigramIndices.ContainsKey(trigram))
                    TrigramIndices[trigram].Add(index);
                else
                    TrigramIndices.Add(trigram,
                        new HashSet<int>(new[] { index }));
        }

        public IEnumerable<T> SearchEntry(string query)
        {
            var trigrams = query.ToTrigrams();
            var perTrigramIndexSets = trigrams
                .Where(trigram => TrigramIndices.ContainsKey(trigram))
                .Select(trigram => TrigramIndices[trigram]);

            if (!perTrigramIndexSets.Any())
                return Enumerable.Empty<T>();

            var allUniqueIndices = perTrigramIndexSets
                .SelectMany(x => x)
                .Distinct();

            return allUniqueIndices.Select(i => Entries[i]);
        }
    }
}