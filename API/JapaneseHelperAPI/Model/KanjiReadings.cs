using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace JapaneseHelperAPI.Model
{
    [Index(nameof(Id), nameof(On), nameof(Kun), nameof(Nanori))]
    public class KanjiReadings
    {
        [Key] public int Id { get; set; }

        public string[] On { get; set; }
        public string[] Kun { get; set; }
        public string[] Nanori { get; set; }
    }
}