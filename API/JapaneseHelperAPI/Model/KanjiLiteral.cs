using Microsoft.EntityFrameworkCore;

namespace JapaneseHelperAPI.Model
{
    [Index(nameof(Id), nameof(Literal))]
    public class KanjiLiteral
    {
        public int Id { get; set; }
        public string Literal { get; set; }
    }
}