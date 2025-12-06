# ASSESSMENT REPORT BY ARNOLD MADAYAG : Build a Government Procurement Scraper

## 🎯 Objectives

I built a complete scraping solution that:
1. **Scrapes** procurement opportunities from a government website
2. **Downloads** associated documents to local storage
3. **Transforms** raw data into a normalized format
4. **Follows** industry best practices and design patterns

## SUMMARY

- I completed this scrapping & intaking project with perfect quality by following the best practices like SOLID principals.
- I designed entire project architecture to be easy for extension for other scrapping site than Pensilvania.
- Everything was written in Typescript for the power type safety and clean code, defined clear interface & type, avoiding use of `any`.
- I included test output files in the source code /output folder.
- I used zod schema for data validation.
- I wrote clear comment.


## 🚀 Getting Started

### Step 1: Understand the Target Website
- Analyze the website structure
- Identify listing pages and detail pages
- Check if they use AJAX/API calls
- Note pagination mechanism
- Identify document download patterns

### Step 2: Define Your Schemas



## HOW TO RUN

1. Scrapper
Scrapper has several arguments.
* source : required,  PA for pennsylvania (our site)
* start-page: not required, the start page number to scrape
* end-page: not required, the end page number to scrape

example: 
- npm run scraper source=PA start-page=1 end-page=5
- npm run scraper source=PA start-page=41 end-page=42  ( * use this for testing awards because these pages contains the awards data )

because it support the pagination by the arguments, we can this scrappers in parallel without re-scrapping the same data.

2. Intaker
Intaker has one argument, which is the path to the scrapping source json files.

example: 
- npm run intake ./output/source/session_pennsylvania_page41-page42_1765011524408


## 📁 Project Structure

```
hackathon/
├── base/
│   ├── BaseScraper.ts           # Base scraper class (extend this)
│   ├── BaseExtractor.ts         # Base extractor class
│   └── BaseTransformer.ts       # Transformer base classes
├── extractors/
│   ├──  PAeMarketplace/
│        ├── AwardExtractor.ts           # Extractor class for Award data
│        ├── ContractExtractor.ts         # Extractor class for Contract data
│        └── DocumentExtractor.ts       # Extractor class for Document data
├── schemas/
│   ├── PAeMarketplace/             # Source schemas are different for different website, so i separated them per website folder
│   │   └── source.schema.ts         # Source schema for PA eMaketplace website 
│   └── intake.schema.ts         # Normalized intake schemas for common usage
├── scrappers/
│   ├── PAeMarketplaceScraper.ts           # The scrapper class for PA eMaketplace website  ( Main logic here )
├── transformers/
│   ├── PAeMarketplace/             # Transformers are different for different website, so i separated them per website folder
│       └── AgencyTransformer.ts         # Agency Transformer class for PA eMaketplace website 
│       └── AwardTransformer.ts         # Award Transformer class for PA eMaketplace website 
│       └── ContractTransformer.ts         # Contract Transformer class for PA eMaketplace website 
│       └── DocumentTransformer.ts         # Document Transformer class for PA eMaketplace website 
│       └── PeopleTransformer.ts         #  People Transformer class for PA eMaketplace website 
│       └── SupplierTransformer.ts         # Supplier Transformer class for PA eMaketplace website 
├── utils/
│   ├── cli.ts                   # CLI argument parsing
│   ├── storage.ts               # File system operations
│   └── helpers.ts               # Utility functions
├── scripts/
│   ├── scraper.ts               # Scraper entry point (TODO: implement)
│   └── intake.ts                # Intake entry point (TODO: implement)
├── README.md                    # This file
└── ARCHITECTURE.md              # Architecture guide
```
    

Impress us with:
- 📸 **Screenshots**: Add screenshots of the target website with annotations
- 📝 **Documentation**: Add a SOLUTION.md explaining your approach
- 🧪 **Testing**: Add unit tests for transformers
- 🔄 **Retry Logic**: Implement exponential backoff for failed requests
- 🎨 **Pretty Output**: Format console output with colors and progress bars
- 🔍 **Data Validation**: Add extra validation beyond Zod schemas
- 📊 **Statistics**: Log scraping statistics (success rate, avg time, etc.)
- 🛡️ **Robustness**: Handle edge cases (missing fields, malformed HTML, etc.)


