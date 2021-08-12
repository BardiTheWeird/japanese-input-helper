using System;
using System.Collections.Generic;
using System.Linq;
using JapaneseHelperAPI.Model;
using JapaneseHelperAPI.Services.KanjiSearch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace JapaneseHelperAPI.Controllers
{
    public static class KanjiDictionaryControllerExtensions
    {
        public static IEnumerable<KanjiEntry> SortMeaningsByRelevance(this IEnumerable<KanjiEntry> entries,
            string meaning)
        {
            return entries.Select(entry =>
            {
                entry.Meanings = entry.Meanings.OrderByDescending(s =>
                    TrigramExtensions.JacaardTrigramSimilarity(s, meaning)).ToArray();
                return entry;
            });
        }
    }

    [ApiController]
    [Route("[controller]")]
    public class KanjiDictionaryController : Controller
    {
        private readonly IKanjiDictionaryService _kanjiDictionaryService;
        private readonly ILogger<KanjiDictionaryController> _logger;

        public KanjiDictionaryController(ILogger<KanjiDictionaryController> logger,
            IKanjiDictionaryService kanjiDictionaryService)
        {
            _logger = logger;
            _kanjiDictionaryService = kanjiDictionaryService;
        }

        [HttpGet]
        [Route(
            "meaning={meaning}&sortEntries={sortEntries:bool}&sortMeanings={sortMeanings:bool}&stripReadings={stripReadings:bool}")]
        public ActionResult<IEnumerable<KanjiEntry>> GetKanjiByMeaning(string meaning, bool sortEntries,
            bool sortMeanings, bool stripReadings)
        {
            try
            {
                return Ok(_kanjiDictionaryService.SearchKanjiByMeaning(meaning,
                    sortEntries, sortMeanings: sortMeanings, stripReadings: stripReadings));
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return StatusCode(500);
            }
        }

        // GET
        [HttpGet]
        [Route(
            "meaning={meaning}&topEntries={topEntries}&sortMeanings={sortMeanings:bool}&stripReadings={stripReadings:bool}")]
        public ActionResult<IEnumerable<KanjiEntry>> GetKanjiByMeaning(string meaning, uint topEntries,
            bool sortMeanings, bool stripReadings)
        {
            try
            {
                return Ok(_kanjiDictionaryService.SearchKanjiByMeaning(meaning,
                    topEntries: topEntries, sortMeanings: sortMeanings, stripReadings: stripReadings));
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return StatusCode(500);
            }
        }

        [HttpGet]
        [Route(
            "meaning={meaning}&topEntries={topEntries}&topMeanings={topMeanings}&stripReadings={stripReadings:bool}")]
        public ActionResult<IEnumerable<KanjiEntry>> GetKanjiByMeaning(string meaning, uint topEntries,
            uint topMeanings, bool stripReadings)
        {
            try
            {
                return Ok(_kanjiDictionaryService.SearchKanjiByMeaning(meaning,
                    topEntries: topEntries, topMeanings: topMeanings, stripReadings: stripReadings));
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return StatusCode(500);
            }
        }

        [HttpGet]
        [Route("id={id}")]
        public ActionResult<KanjiEntry> GetKanjiById(int id)
        {
            var res = _kanjiDictionaryService.GetKanjiById(id);
            if (res == null)
                return BadRequest();

            return Ok(res);
        }
    }
}