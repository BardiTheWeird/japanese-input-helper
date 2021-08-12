using System;
using AspNetCoreRateLimit;
using Google.Cloud.Translation.V2;
using JapaneseHelperAPI.Data;
using JapaneseHelperAPI.Services.KanjiSearch;
using JapaneseHelperAPI.Services.Translation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace JapaneseHelperAPI
{
    public class Startup
    {
        public const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();
            services.AddMemoryCache();

            services.Configure<IpRateLimitOptions>(Configuration.GetSection("IpRateLimiting"));
            
            services.AddInMemoryRateLimiting();
            
            var environmentVariables = Environment.GetEnvironmentVariables();

            var kanjiSearchProvider = environmentVariables["KANJI_SEARCH_PROVIDER"];
            switch (kanjiSearchProvider)
            {
                case "RdsPostgreSql":
                    var hostname = environmentVariables["AWS_RDS_HOSTNAME"] as string;
                    var username = environmentVariables["AWS_RDS_USERNAME"] as string;
                    var dbname = environmentVariables["AWS_RDS_DBNAME"] as string;
                    var password = environmentVariables["AWS_RDS_PASSWORD"] as string;
                    var connectionString = $"Host={hostname};Database={dbname};Username={username};Password={password}";
                    if (string.IsNullOrEmpty(hostname) || string.IsNullOrEmpty(username) ||
                        string.IsNullOrEmpty(dbname) || string.IsNullOrEmpty(password))
                        throw new ArgumentNullException(
                            "Couldn't get either database hostname, username or dbname from environment");

                    services.AddDbContext<KanjiDatabaseContext>(options =>
                        options.UseNpgsql(connectionString));

                    services.AddScoped<IKanjiDictionaryService, PostgreSqlKanjiSearch>();
                    break;

                case "CustomTrigramIndexer":
                    services.AddSingleton<IKanjiDictionaryService, CustomTrigramIndexerKanjiDictionaryService>(
                        provider =>
                        {
                            var logger = provider.GetService<ILogger<CustomTrigramIndexerKanjiDictionaryService>>();
                            try
                            {
                                var kd2 = DbInitializer.GetKd2();
                                var indexer = new CustomTrigramIndexerKanjiDictionaryService(kd2,
                                    provider.GetService<ILogger<CustomTrigramIndexerKanjiDictionaryService>>());
                                return indexer;
                            }
                            catch (Exception e)
                            {
                                logger.LogInformation(
                                    $"Couldn't initialize {nameof(CustomTrigramIndexerKanjiDictionaryService)}. Error: {e}");
                                throw;
                            }
                        });
                    break;

                default:
                    throw new ArgumentException(
                        $"Could not initialize a KanjiSearchProvider ${kanjiSearchProvider}");
            }

            services.AddControllers()
                .AddJsonOptions(options => options.JsonSerializerOptions.IgnoreNullValues = true);
            
            services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

            services.AddSingleton(provider =>
            {
                var builder = new TranslationClientBuilder();
                builder.TranslationModel = TranslationModel.Base;
                var apiKey = environmentVariables["GOOGLE_CLOUD_TRANSLATE_KEY"] as string;
                if (string.IsNullOrEmpty(apiKey))
                    Console.WriteLine("Couldn't get Google Cloud Translate API key from environment");
                builder.ApiKey = apiKey;
                return builder.Build();
            });

            services.AddSingleton<ITranslationService, GoogleCloudTranslator>();

            services.AddCors(options =>
            {
                options.AddPolicy(MyAllowSpecificOrigins,
                    builder =>
                    {
                        builder.WithOrigins("https://localhost:4200, *")
                            .AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseIpRateLimiting();
            
            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors(MyAllowSpecificOrigins);

            app.UseAuthorization();

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}