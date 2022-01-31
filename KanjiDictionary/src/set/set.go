package set

import "fmt"

type StringSet map[string]struct{}

func (set StringSet) Copy() StringSet {
	newStringSet := StringSet{}
	for v, _ := range set {
		newStringSet.Add(v)
	}
	return newStringSet
}

func (set StringSet) Add(s string) {
	set[s] = struct{}{}
}

func (set StringSet) Remove(s string) {
	delete(set, s)
}

func (set StringSet) Has(s string) bool {
	_, ok := set[s]
	return ok
}

func (set StringSet) Print() {
	for v, _ := range set {
		fmt.Printf("'%s' ", v)
	}
	fmt.Println()
}

func (set StringSet) Union(other StringSet) StringSet {
	newStringSet := set.Copy()
	for v, _ := range other {
		newStringSet.Add(v)
	}
	return newStringSet
}

func (set StringSet) Intersection(other StringSet) StringSet {
	newStringSet := StringSet{}
	for v, _ := range set {
		if other.Has(v) {
			newStringSet.Add(v)
		}
	}
	return newStringSet
}

type IntSet map[int]struct{}

func (set IntSet) Copy() IntSet {
	newIntSet := IntSet{}
	for v, _ := range set {
		newIntSet.Add(v)
	}
	return newIntSet
}

func (set IntSet) Add(s int) {
	set[s] = struct{}{}
}

func (set IntSet) Remove(s int) {
	delete(set, s)
}

func (set IntSet) Has(s int) bool {
	_, ok := set[s]
	return ok
}

func (set IntSet) Print() {
	for v, _ := range set {
		fmt.Printf("'%s' ", v)
	}
	fmt.Println()
}

func (set IntSet) Union(other IntSet) IntSet {
	newIntSet := set.Copy()
	for v, _ := range other {
		newIntSet.Add(v)
	}
	return newIntSet
}

func (set IntSet) Intersection(other IntSet) IntSet {
	newIntSet := IntSet{}
	for v, _ := range set {
		if other.Has(v) {
			newIntSet.Add(v)
		}
	}
	return newIntSet
}
