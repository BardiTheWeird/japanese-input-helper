using JapaneseHelperAPI.Model;
using Microsoft.EntityFrameworkCore;

namespace JapaneseHelperAPI.Data
{
    public class KanjiDatabaseContext : DbContext
    {
        public KanjiDatabaseContext(DbContextOptions<KanjiDatabaseContext> options) : base(options)
        {
        }

        public DbSet<KanjiLiteral> KanjiLiterals { get; set; }
        public DbSet<KanjiMeaning> KanjiMeanings { get; set; }
        public DbSet<KanjiReadings> KanjiReadings { get; set; }
        public DbSet<KanjiEntry> KanjiEntries { get; set; }
        public DbSet<KanjiEntryNoReadings> KanjiEntriesNoReadings { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                .UseNpgsql()
                .UseSnakeCaseNamingConvention();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<KanjiLiteral>().ToTable("literals");
            modelBuilder.Entity<KanjiMeaning>().ToTable("meanings");
            modelBuilder.Entity<KanjiReadings>().ToTable("readings");

            modelBuilder.Entity<KanjiEntry>().HasNoKey().ToView(null);
            modelBuilder.Entity<KanjiEntryNoReadings>().HasNoKey().ToView(null);
        }
    }
}