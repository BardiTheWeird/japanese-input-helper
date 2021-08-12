using System;
using System.Collections.Generic;
using System.Linq;
using JapaneseHelperAPI.Data;
using JapaneseHelperAPI.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace JapaneseHelperAPI.Services.KanjiSearch
{
    public class PostgreSqlKanjiSearch : IKanjiDictionaryService
    {
        private readonly KanjiDatabaseContext _dbContext;
        private readonly ILogger<PostgreSqlKanjiSearch> _logger;

        public PostgreSqlKanjiSearch(ILogger<PostgreSqlKanjiSearch> logger, KanjiDatabaseContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
            
            try
            {
                dbContext.Database.EnsureCreated();
                dbContext.Initialize();
            }
            catch (Exception e)
            {
                _logger.LogError($"An error occured when creating a DB: {e.Message}");
            }
        }

        public IEnumerable<KanjiEntry> SearchKanjiByMeaning(string meaning, bool sortEntries = false,
            uint? topEntries = null,
            bool sortMeanings = false, uint? topMeanings = null, bool stripReadings = false)
        {
            try
            {
                if (string.IsNullOrEmpty(meaning.Trim()))
                    return Enumerable.Empty<KanjiEntry>();

                sortEntries = sortMeanings || topEntries.HasValue;
                sortMeanings = sortMeanings || topMeanings.HasValue;
                var needsSorting = sortEntries || sortMeanings;

                var fuzzyMatchMeaning = '%' + string.Join('%', meaning.Select(x => x)) + '%';

                var fuzzyMatchMeaningParameter = new NpgsqlParameter("@fuzzyMatchMeaning", fuzzyMatchMeaning);
                var meaningParameter = new NpgsqlParameter("@meaning", meaning);

                var query =
                    @"WITH meanings_fuzzy_match_grouped AS(
                        SELECT id, ARRAY_AGG(meaning) AS mean_arr
                        FROM meanings
                        WHERE id IN (
                            SELECT id
                            FROM meanings
                            WHERE meaning LIKE  @fuzzyMatchMeaning)
                        GROUP BY id),";

                if (needsSorting)
                {
                    var limitMeanings = !topMeanings.HasValue
                        ? ""
                        : $"LIMIT {topMeanings.Value}";

                    var meaningSort = !sortMeanings
                        ? ""
                        : @"ARRAY (SELECT x 
                                       FROM unnest(mean_arr) AS x
                                       ORDER BY x <-> @meaning " +
                          $"{limitMeanings}) AS";

                    var limitEntries = !topEntries.HasValue
                        ? ""
                        : @$"LIMIT {topEntries.Value}";

                    var byMeaningSort = !sortEntries
                        ? ""
                        : @"ORDER BY (
                                SELECT MAX(x <-> @meaning)
                                FROM unnest(mean_arr) AS x)" +
                          $"{limitEntries}";
                    query +=
                        @$"meanings_ordered_limited AS(
                            SELECT id, 
                                   {meaningSort} mean_arr
                            FROM meanings_fuzzy_match_grouped
                            {byMeaningSort}),";
                }

                var prevTableName = !needsSorting
                    ? "meanings_fuzzy_match_grouped"
                    : "meanings_ordered_limited";

                query +=
                    @$"literals_joined AS(
                        SELECT m.id, l.literal, m.mean_arr AS meanings
                        FROM {prevTableName} m
                        INNER JOIN literals l ON m.id=l.id)";

                var selectFrom = "literals_joined";

                if (!stripReadings)
                {
                    selectFrom = "readings_joined";

                    query +=
                        @$",readings_joined AS(
                                SELECT l.id, l.literal, l.meanings, r.{"\"on\""}, r.kun, r.nanori
                                FROM literals_joined l
                                INNER JOIN readings r ON l.id=r.id)";
                }

                query += @$"SELECT * FROM {selectFrom}";
                
                IQueryable<KanjiEntry> res;

                IQueryable<T> QueryFunction<T>(DbSet<T> dbSet) where T : class
                {
                    return dbSet.FromSqlRaw(query, fuzzyMatchMeaningParameter, meaningParameter);
                }

                if (stripReadings)
                    res = QueryFunction(_dbContext.KanjiEntriesNoReadings)
                        .Select(e => new KanjiEntry
                        {
                            Id = e.Id,
                            Literal = e.Literal,
                            Meanings = e.Meanings,
                            On = null,
                            Kun = null,
                            Nanori = null
                        });
                else
                    res = QueryFunction(_dbContext.KanjiEntries);

                return res.ToList();
            }
            catch (Exception e)
            {
                _logger.LogError($"Couldn't search kanji by meaning {meaning}. {e.Message}");
                return Enumerable.Empty<KanjiEntry>();
            }
        }

        public KanjiEntry GetKanjiById(int id)
        {
            try
            {
                var idParameter = new NpgsqlParameter("@id", id);
                var query = _dbContext.KanjiEntries
                    .FromSqlRaw(
                        $@"WITH related_meanings AS(
                            SELECT id, ARRAY_AGG(meaning) AS meanings
                            FROM meanings
                            WHERE id=@id
                            GROUP BY id),

                        related_readings AS(
                            SELECT id, {"\"on\""}, kun, nanori
                            FROM readings
                            WHERE id=@id),
                             
                        related_literal AS(
                            SELECT id, literal
                            FROM literals
                            WHERE id=@id)

                            Select m.id, literal, meanings, {"\"on\""}, kun, nanori
                            FROM related_meanings m
                            INNER JOIN related_readings r ON m.id=r.id
                            INNER JOIN related_literal l ON m.id=l.id",
                        idParameter);

                return query.OrderBy(e => e.Id).FirstOrDefault();
            }
            catch (Exception e)
            {
                _logger.LogError($"Couldn't find KanjiEntry with id {id}. {e.Message}");
                return null;
            }
        }
    }
}