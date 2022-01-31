package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sort"
	"syscall/js"

	"github.com/BardiTheWeird/japanese-input-helper/KanjiDictionary/src/set"
)

var (
	kanjiEntries   []KanjiEntry
	trigramToIndex map[string]set.IntSet = make(map[string]set.IntSet)
)

type KanjiEntry struct {
	Id       int      `json:"id"`
	Literal  string   `json:"literal"`
	Meanings []string `json:"meanings"`

	// Readings
	On     []string `json:"on"`
	Kun    []string `json:"kun"`
	Nanori []string `json:"nanori"`
}

func (entry KanjiEntry) Print() {
	fmt.Printf("id: %d\nliteral: %s\n", entry.Id, entry.Literal)

	if len(entry.Meanings) > 0 {
		fmt.Println("meanings:")
		for _, meaning := range entry.Meanings {
			fmt.Printf("\t%s\n", meaning)
		}
	}

	if len(entry.On) > 0 {
		fmt.Println("on:")
		for _, on := range entry.On {
			fmt.Printf("\t%s\n", on)
		}
	}

	if len(entry.Kun) > 0 {
		fmt.Println("kun:")
		for _, kun := range entry.Kun {
			fmt.Printf("\t%s\n", kun)
		}
	}

	if len(entry.Nanori) > 0 {
		fmt.Println("nanori:")
		for _, nanori := range entry.Nanori {
			fmt.Printf("\t%s\n", nanori)
		}
	}
}

type KanjiEntryWithMaxSimilaity struct {
	KanjiEntry
	similarity float32
}

type MeaningWithSimilarity struct {
	meaning    string
	similarity float32
}

func generateTrigrams(in string) set.StringSet {
	if len(in) == 0 {
		return nil
	}

	trigrams := set.StringSet{}
	max_substring_len := 3
	if len(in) < 3 {
		max_substring_len = len(in)
	}

	for substring_len := 1; substring_len <= max_substring_len; substring_len++ {
		for i := 0; i < len(in)-substring_len+1; i++ {
			trigrams.Add(in[i : i+substring_len])
		}
	}

	return trigrams
}

func trigramSimilarity(s1, s2 string) float32 {
	t1 := generateTrigrams(s1)
	t2 := generateTrigrams(s2)

	return jaccardSimilarity(t1, t2)
}

func jaccardSimilarity(s1, s2 set.StringSet) float32 {
	intersection := s1.Intersection(s2)
	union := s1.Union(s2)

	var coeff float32 = 1.0
	if len(union) > 0 {
		coeff = float32(len(intersection)) / float32(len(union))
	}

	return coeff
}

func parseKanjiEntries() {
	kanjiDictPath := "https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/API/JapaneseHelperAPI/Assets/kd2.json"
	resp, err := http.Get(kanjiDictPath)
	if err != nil {
		fmt.Printf("Error downloading from %s: %s\n", kanjiDictPath, err)
		os.Exit(1)
	}

	defer resp.Body.Close()
	byteValue, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading from request body: %s", err)
	}

	json.Unmarshal(byteValue, &kanjiEntries)
	fmt.Printf("read %d kanji entries\n", len(kanjiEntries))
}

func indexKanjiEntries() {
	for _, entry := range kanjiEntries {
		for _, meaning := range entry.Meanings {
			for trigram := range generateTrigrams(meaning) {
				_, ok := trigramToIndex[trigram]
				if !ok {
					trigramToIndex[trigram] = set.IntSet{}
				}
				trigramToIndex[trigram].Add(entry.Id)
			}
		}
	}
}

func GetEntriesByMeaning(query string, top int) []KanjiEntry {
	// Getting all the entries containing at least a single query trigram
	entryIndices := set.IntSet{}

	trigrams := generateTrigrams(query)
	for trigram := range trigrams {
		entryIndices = entryIndices.Union(trigramToIndex[trigram])
	}

	// Map indices onto KanjiEntry
	entries := make([]KanjiEntryWithMaxSimilaity, 0, len(entryIndices))
	for id := range entryIndices {
		entries = append(entries, KanjiEntryWithMaxSimilaity{kanjiEntries[id-1], 0.0})
	}

	// Fill in max meaning similarity and sort meaning by similarity
	for i := 0; i < len(entries); i++ {
		entry := &(entries[i])
		meaningsWithSimilarity := make([]MeaningWithSimilarity, 0, len(entry.Meanings))
		for _, meaning := range entry.Meanings {
			meaningsWithSimilarity = append(meaningsWithSimilarity, MeaningWithSimilarity{
				meaning:    meaning,
				similarity: trigramSimilarity(query, meaning),
			})
		}

		sort.Slice(meaningsWithSimilarity, func(i, j int) bool {
			return meaningsWithSimilarity[i].similarity > meaningsWithSimilarity[j].similarity
		})

		// fmt.Println(meaningsWithSimilarity)

		entry.similarity = meaningsWithSimilarity[0].similarity
		for i, v := range meaningsWithSimilarity {
			entry.Meanings[i] = v.meaning
		}
	}

	// Sorting by max meaning similarity
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].similarity > entries[j].similarity
	})

	fmt.Printf("num of indices for %s: %d\n", query, len(entries))

	// Map without similarity
	if len(entries) < top {
		top = len(entries)
	}
	kanjiEntries := make([]KanjiEntry, 0, top)

	for _, entry := range entries[:top] {
		kanjiEntries = append(kanjiEntries, entry.KanjiEntry)
	}

	fmt.Printf("num of kanjiEntries for %s: %d\n", query, len(kanjiEntries))

	return kanjiEntries
}

func getEntriesByMeaningWrapper() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 2 {
			return "Invalid number of arguments"
		}
		entries := GetEntriesByMeaning(args[0].String(), args[1].Int())
		entriesJson, _ := json.Marshal(entries)
		return string(entriesJson)
	})
}

func GetEntryById(id int) KanjiEntry {
	return kanjiEntries[id]
}

func getEntryByIdWrapper() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) != 1 {
			return "Invalid number of arguments"
		}
		entry := GetEntryById(args[0].Int())
		entryJson, _ := json.Marshal(entry)
		return string(entryJson)
	})
}

func exposeApiFunctions() {
	js.Global().Set("GetKanjiEntryByMeaning", getEntriesByMeaningWrapper())
	js.Global().Set("GetKanjiEntryById", getEntryByIdWrapper())
}

func main() {
	parseKanjiEntries()
	indexKanjiEntries()
	exposeApiFunctions()

	// eternal slumber
	c := make(chan interface{}, 0)
	<-c
}
