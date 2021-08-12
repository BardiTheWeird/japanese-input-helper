using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace JapaneseHelperAPI.Model
{
    [Index(nameof(Id), nameof(Meaning))]
    public class KanjiMeaning
    {
        [Key] public int PrimaryId { get; set; }

        public int Id { get; set; }
        public string Meaning { get; set; }
    }
}