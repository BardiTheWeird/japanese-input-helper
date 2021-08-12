using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using JapaneseHelperAPI.Model;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace JapaneseHelperAPI.Data
{
    public static class DbInitializer
    {
        private const string Kd2Link =
            @"https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/Assets/kd2.json";

        private const string Kd2LocalPath = @"Assets/kd2.json";

        public static KanjiEntry[] GetKd2()
        {
            try
            {
                string jsonStr;

                if (File.Exists(Kd2LocalPath))
                {
                    jsonStr = File.ReadAllText(Kd2LocalPath);
                }
                else
                {
                    using var wc = new WebClient();
                    jsonStr = wc.DownloadString(Kd2Link);
                }

                return JsonConvert.DeserializeObject<KanjiEntry[]>(jsonStr);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Couldn't retrieve KD2. Error: {e}");
                return null;
            }
        }

        private static string[] ToNullIfEmpty(string[] arr)
        {
            return arr?.Length > 0 ? arr : null;
        }
        
        public static void Initialize(this KanjiDatabaseContext context)
        {
            if (context.KanjiLiterals.Any())
                return;

            Console.WriteLine("Initializing the database...");

            var kd2 = GetKd2();
            foreach (var entry in kd2)
            {
                context.KanjiLiterals.Add(new KanjiLiteral
                {
                    Id = entry.Id,
                    Literal = entry.Literal
                });

                context.KanjiMeanings.AddRange(
                    entry.Meanings.Select(meaning => new KanjiMeaning
                    {
                        Id = entry.Id,
                        Meaning = meaning
                    }));

                context.KanjiReadings.Add(new KanjiReadings
                {
                    Id = entry.Id,
                    On = ToNullIfEmpty(entry.On),
                    Kun = ToNullIfEmpty(entry.Kun),
                    Nanori = ToNullIfEmpty(entry.Nanori)
                });
            }

            context.SaveChanges();

            context.Database.ExecuteSqlRaw(@"CREATE INDEX meanings_trgm_index
ON meanings
USING GIN(meaning gin_trgm_ops)");

            context.SaveChanges();
        }
    }
}