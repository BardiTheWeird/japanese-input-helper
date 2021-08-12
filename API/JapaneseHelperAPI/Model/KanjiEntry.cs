using Microsoft.EntityFrameworkCore;

namespace JapaneseHelperAPI.Model
{
    [Keyless]
    public class KanjiEntry
    {
        public int Id { get; set; }
        public string Literal { get; set; }

        public string[] Meanings { get; set; }

        // Readings
        public string[] On { get; set; }
        public string[] Kun { get; set; }
        public string[] Nanori { get; set; }
    }

    [Keyless]
    public class KanjiEntryNoReadings
    {
        public int Id { get; set; }
        public string Literal { get; set; }
        public string[] Meanings { get; set; }
    }
}